import { NextRequest, NextResponse } from "next/server"
import {
  InvalidWebhookSignatureError,
  Payment,
  WebhookSignatureValidator,
} from "mercadopago"
import type { MercadoPagoConfig } from "mercadopago"
import {
  MP_WEBHOOK_SECRET,
  getMercadoPagoClient,
  toPaymentStatus,
} from "@/lib/mercado-pago/client"
import { getPreapproval } from "@/lib/mercado-pago/preapproval"
import {
  classifyEvent,
  isPreapprovalActive,
  reconcileRecurringCharge,
} from "@/lib/mercado-pago/subscription-events"
import prisma from "@/lib/db/db"

// Margen de reloj aceptado para la firma. Acota la ventana de un reenvío
// malicioso de una notificación vieja.
const SIGNATURE_TOLERANCE_SECONDS = 300

export const dynamic = "force-dynamic"

/**
 * La preaprobación cambió de estado en Mercado Pago.
 *
 * El cliente puede autorizar, pausar o cancelar desde su cuenta de Mercado
 * Pago, sin pasar por nuestra aplicación, así que el estado se relee de allá y
 * la suscripción sigue lo que diga: si el débito dejó de estar autorizado,
 * deja de generar pedidos.
 */
const handlePreapprovalEvent = async (preapprovalId: string) => {
  const preapproval = await getPreapproval(preapprovalId)

  if (!preapproval) return

  const subscription = await prisma.subscription.findUnique({
    where: { mercadoPagoPreapprovalId: preapprovalId },
    select: { id: true },
  })

  if (!subscription) {
    console.warn(`Preaprobación ${preapprovalId} sin suscripción asociada.`)
    return
  }

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      preapprovalStatus: preapproval.status,
      isActive: isPreapprovalActive(preapproval.status),
    },
  })
}

/**
 * Mercado Pago cobró una cuota de la suscripción.
 *
 * Se salda el pedido pendiente más reciente de esa suscripción. Como el monto
 * es fijo, el total del pedido puede diferir si cambiaron los precios: en ese
 * caso el pedido se marca pagado igual —el cliente pagó lo que autorizó— y la
 * diferencia queda anotada para conciliarla.
 */
const handleRecurringCharge = async (
  client: MercadoPagoConfig,
  authorizedPaymentId: string
) => {
  const payment = await new Payment(client).get({ id: authorizedPaymentId })

  if (toPaymentStatus(payment.status) !== "PAID") {
    console.warn(
      `Cobro recurrente ${authorizedPaymentId} no aprobado (${payment.status}).`
    )
    return
  }

  const preapprovalId = payment.metadata?.preapproval_id
    ? String(payment.metadata.preapproval_id)
    : payment.external_reference

  if (!preapprovalId) {
    console.warn(`Cobro recurrente ${authorizedPaymentId} sin referencia.`)
    return
  }

  const subscription = await prisma.subscription.findFirst({
    where: {
      OR: [
        { mercadoPagoPreapprovalId: preapprovalId },
        { id: preapprovalId },
      ],
    },
    select: { id: true, customerId: true, shopId: true },
  })

  if (!subscription) {
    console.warn(
      `Cobro recurrente ${authorizedPaymentId} sin suscripción asociada.`
    )
    return
  }

  const order = await prisma.order.findFirst({
    where: {
      customerId: subscription.customerId,
      shopId: subscription.shopId,
      paymentStatus: "PENDING",
      status: { not: "CANCELLED" },
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, total: true, notes: true },
  })

  if (!order) {
    console.warn(
      `Cobro recurrente ${authorizedPaymentId} sin pedido pendiente que saldar.`
    )
    return
  }

  const { difference, matches } = reconcileRecurringCharge({
    chargedAmount: Number(payment.transaction_amount ?? 0),
    orderTotal: order.total,
  })

  const note = matches
    ? order.notes
    : [
        order.notes,
        `Débito automático por ${payment.transaction_amount}; el pedido totaliza ${order.total} (diferencia ${difference}).`,
      ]
        .filter(Boolean)
        .join(" ")

  if (!matches) {
    console.warn(
      `Diferencia en el débito de la suscripción ${subscription.id}: ${difference}.`
    )
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { paymentStatus: "PAID", notes: note },
  })
}

/**
 * Notificaciones de pago de Mercado Pago.
 *
 * Nada del cuerpo de la notificación se toma como verdad: se valida la firma y
 * después se consulta el pago contra la API de Mercado Pago con las
 * credenciales del comercio. El importe cobrado se compara contra el total
 * guardado del pedido antes de darlo por pagado.
 */
export async function POST(request: NextRequest) {
  const client = getMercadoPagoClient()

  if (!client || !MP_WEBHOOK_SECRET) {
    console.error("Mercado Pago webhook recibido sin configuración completa.")
    // 200 para que Mercado Pago no reintente indefinidamente algo que este
    // entorno no puede procesar.
    return NextResponse.json({ received: true })
  }

  const dataId = request.nextUrl.searchParams.get("data.id")

  try {
    WebhookSignatureValidator.validate({
      xSignature: request.headers.get("x-signature"),
      xRequestId: request.headers.get("x-request-id"),
      dataId,
      secret: MP_WEBHOOK_SECRET,
      toleranceSeconds: SIGNATURE_TOLERANCE_SECONDS,
    })
  } catch (error) {
    if (error instanceof InvalidWebhookSignatureError) {
      console.warn(
        `Firma de webhook inválida (${error.reason}) requestId=${error.requestId}`
      )
      return new NextResponse(null, { status: 401 })
    }
    throw error
  }

  try {
    const body = await request.json().catch(() => null)
    const type = body?.type ?? request.nextUrl.searchParams.get("type")
    const event = classifyEvent(type, dataId ?? body?.data?.id)

    if (event.kind === "preapproval") {
      await handlePreapprovalEvent(event.id)
      return NextResponse.json({ received: true })
    }

    if (event.kind === "authorized_payment") {
      await handleRecurringCharge(client, event.id)
      return NextResponse.json({ received: true })
    }

    // El resto se confirma y se ignora para que no se reintente.
    if (event.kind !== "payment") {
      return NextResponse.json({ received: true })
    }

    const paymentId = event.id

    const payment = await new Payment(client).get({ id: String(paymentId) })
    const orderId = payment.external_reference

    if (!orderId) {
      console.warn(`Pago ${paymentId} sin external_reference.`)
      return NextResponse.json({ received: true })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, total: true, paymentStatus: true },
    })

    if (!order) {
      console.warn(`Pago ${paymentId} referencia un pedido inexistente.`)
      return NextResponse.json({ received: true })
    }

    const paymentStatus = toPaymentStatus(payment.status)

    // Un pago aprobado por un importe distinto al del pedido no se da por
    // válido: se registra para revisarlo a mano.
    if (paymentStatus === "PAID") {
      const paidAmount = Number(payment.transaction_amount ?? 0)
      const expected = Number(order.total.toFixed(2))

      if (Math.abs(paidAmount - expected) > 0.01) {
        console.error(
          `Importe distinto en el pago ${paymentId}: cobrado ${paidAmount}, esperado ${expected}.`
        )
        return NextResponse.json({ received: true })
      }
    }

    if (order.paymentStatus !== paymentStatus) {
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus },
      })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error procesando webhook de Mercado Pago:", error)
    // 500 hace que Mercado Pago reintente, que es lo correcto ante una falla
    // transitoria de red o base de datos.
    return new NextResponse(null, { status: 500 })
  }
}

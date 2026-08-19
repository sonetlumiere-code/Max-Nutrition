import { NextRequest, NextResponse } from "next/server"
import {
  InvalidWebhookSignatureError,
  Payment,
  WebhookSignatureValidator,
} from "mercadopago"
import {
  MP_WEBHOOK_SECRET,
  getMercadoPagoClient,
  toPaymentStatus,
} from "@/lib/mercado-pago/client"
import prisma from "@/lib/db/db"

// Margen de reloj aceptado para la firma. Acota la ventana de un reenvío
// malicioso de una notificación vieja.
const SIGNATURE_TOLERANCE_SECONDS = 300

export const dynamic = "force-dynamic"

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

    // Solo interesan las notificaciones de pago; el resto se confirma y se
    // ignora para que no se reintenten.
    if (type !== "payment") {
      return NextResponse.json({ received: true })
    }

    const paymentId = dataId ?? body?.data?.id

    if (!paymentId) {
      return NextResponse.json({ received: true })
    }

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

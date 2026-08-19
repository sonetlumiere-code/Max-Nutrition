"use server"

import { Preference } from "mercadopago"
import {
  getMercadoPagoClient,
  isMercadoPagoConfigured,
} from "@/lib/mercado-pago/client"
import { verifySession } from "@/lib/auth/verify-session"
import prisma from "@/lib/db/db"

const baseUrl = process.env.BASE_URL

/**
 * Crea la preferencia de pago de un pedido y devuelve el link de Mercado Pago.
 *
 * El importe se toma del total ya guardado en el pedido, calculado en el
 * servidor: nunca llega del cliente.
 */
export async function createPaymentPreference({
  orderId,
}: {
  orderId: string
}) {
  const session = await verifySession()
  const user = session?.user

  if (!user) {
    return { error: "No autorizado." }
  }

  const client = getMercadoPagoClient()

  if (!isMercadoPagoConfigured || !client) {
    return { error: "Los pagos online no están disponibles en este momento." }
  }

  if (!baseUrl) {
    return { error: "Falta configurar la URL del sitio." }
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: { select: { userId: true, name: true } },
        shop: { select: { key: true, name: true } },
      },
    })

    if (!order || order.customer?.userId !== user.id) {
      return { error: "Pedido no encontrado." }
    }

    if (order.paymentStatus === "PAID") {
      return { error: "Ese pedido ya fue pagado." }
    }

    if (order.total <= 0) {
      return { error: "El total del pedido no admite pago online." }
    }

    const preference = await new Preference(client).create({
      body: {
        // Un único ítem por el total del pedido: así lo que cobra Mercado Pago
        // coincide siempre con lo que el servidor calculó, con promociones y
        // envío ya aplicados.
        items: [
          {
            id: order.id,
            title: `Pedido en ${order.shop?.name ?? "Máxima Nutrición"}`,
            quantity: 1,
            unit_price: Number(order.total.toFixed(2)),
            currency_id: "ARS",
          },
        ],
        // Permite reconciliar la notificación con el pedido.
        external_reference: order.id,
        back_urls: {
          success: `${baseUrl}/order-confirmed/${order.id}`,
          pending: `${baseUrl}/order-confirmed/${order.id}`,
          failure: `${baseUrl}/order-confirmed/${order.id}`,
        },
        auto_return: "approved",
        notification_url: `${baseUrl}/api/webhooks/mercado-pago`,
      },
    })

    const checkoutUrl = preference.init_point

    if (!checkoutUrl) {
      return { error: "No se pudo generar el link de pago." }
    }

    return { success: { checkoutUrl } }
  } catch (error) {
    console.error("Error creating Mercado Pago preference:", error)
    return { error: "Hubo un error al iniciar el pago." }
  }
}

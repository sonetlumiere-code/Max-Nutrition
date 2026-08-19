import "server-only"

import prisma from "@/lib/db/db"
import { businessWeekday } from "@/helpers/subscriptions"
import { isPreapprovalActive } from "@/lib/mercado-pago/subscription-events"
import { PaymentMethod } from "@prisma/client"

/**
 * Suscripciones para el panel del comercio, con lo necesario para responderle
 * a un cliente por teléfono y para anticipar la producción de la semana.
 */
export const getSubscriptionsOverview = async (now: Date = new Date()) => {
  const subscriptions = await prisma.subscription.findMany({
    include: {
      customer: {
        select: { name: true, phone: true, user: { select: { email: true } } },
      },
      shop: { select: { name: true, key: true } },
      items: { include: { product: { select: { name: true, price: true } } } },
    },
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
  })

  const today = businessWeekday(now)

  const enriched = subscriptions.map((subscription) => {
    const units = subscription.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    )

    // Lo que valdría el pedido hoy, para contrastarlo contra el monto fijo
    // que el cliente autorizó.
    const currentValue = subscription.items.reduce(
      (sum, item) => sum + (item.product?.price ?? 0) * item.quantity,
      0
    )

    const isAutomatic = subscription.paymentMethod === PaymentMethod.MERCADO_PAGO

    return {
      ...subscription,
      units,
      currentValue,
      isAutomatic,
      // Con débito automático hace falta además la autorización vigente.
      isReady:
        subscription.isActive &&
        (!isAutomatic || isPreapprovalActive(subscription.preapprovalStatus)),
      generatesToday: subscription.weekday === today,
    }
  })

  const active = enriched.filter((subscription) => subscription.isReady)

  return {
    subscriptions: enriched,
    stats: {
      total: enriched.length,
      active: active.length,
      // Suma de los montos fijos comprometidos por semana.
      weeklyCommitted: active.reduce(
        (sum, subscription) => sum + (subscription.amount ?? 0),
        0
      ),
      pendingAuthorization: enriched.filter(
        (subscription) =>
          subscription.isAutomatic &&
          subscription.preapprovalStatus === "pending"
      ).length,
      generatingToday: active.filter(
        (subscription) => subscription.generatesToday
      ).length,
    },
  }
}

export type SubscriptionsOverview = Awaited<
  ReturnType<typeof getSubscriptionsOverview>
>

"use server"

import { DayOfWeek, ShippingMethod } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { verifySession } from "@/lib/auth/verify-session"
import prisma from "@/lib/db/db"

/**
 * Crea una suscripción semanal a partir de un pedido que el cliente ya hizo.
 *
 * Se copian los productos, el modo de entrega y el medio de pago; los precios
 * no, porque cada pedido generado se arma con los precios del momento.
 */
export async function createSubscriptionFromOrder({
  orderId,
  weekday,
}: {
  orderId: string
  weekday: DayOfWeek
}) {
  const session = await verifySession()
  const user = session?.user

  if (!user) {
    return { error: "No autorizado." }
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: { select: { id: true, userId: true } },
        items: true,
        shop: { select: { id: true, key: true } },
      },
    })

    if (!order || order.customer?.userId !== user.id) {
      return { error: "Pedido no encontrado." }
    }

    if (!order.items.length) {
      return { error: "Ese pedido no tiene productos." }
    }

    // Una suscripción activa por tienda alcanza: dos generarían pedidos
    // duplicados sin que el cliente lo note.
    const existing = await prisma.subscription.findFirst({
      where: {
        customerId: order.customer.id,
        shopId: order.shopId,
        isActive: true,
      },
    })

    if (existing) {
      return {
        error: "Ya tenés una suscripción activa en esta tienda.",
      }
    }

    // Consolida por si el pedido trae el mismo producto y variante repetidos.
    const items = Object.values(
      order.items.reduce<
        Record<string, { productId: string; quantity: number; withSalt: boolean }>
      >((acc, item) => {
        const key = `${item.productId}-${item.withSalt}`
        acc[key] ??= {
          productId: item.productId,
          quantity: 0,
          withSalt: item.withSalt,
        }
        acc[key].quantity += item.quantity
        return acc
      }, {})
    )

    const subscription = await prisma.subscription.create({
      data: {
        customerId: order.customer.id,
        shopId: order.shopId,
        customerAddressId:
          order.shippingMethod === ShippingMethod.DELIVERY
            ? order.customerAddressId
            : null,
        shopBranchId:
          order.shippingMethod === ShippingMethod.TAKE_AWAY
            ? order.shopBranchId
            : null,
        shippingMethod: order.shippingMethod,
        paymentMethod: order.paymentMethod,
        weekday,
        items: { create: items },
      },
    })

    revalidatePath(`/${order.shop?.key}/subscriptions`)

    return { success: { subscriptionId: subscription.id } }
  } catch (error) {
    console.error("Error creando la suscripción:", error)
    return { error: "Hubo un error al crear la suscripción." }
  }
}

/** Pausa, reanuda o cambia el día de una suscripción del propio cliente. */
export async function updateSubscription({
  subscriptionId,
  isActive,
  weekday,
}: {
  subscriptionId: string
  isActive?: boolean
  weekday?: DayOfWeek
}) {
  const session = await verifySession()
  const user = session?.user

  if (!user) {
    return { error: "No autorizado." }
  }

  try {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        customer: { select: { userId: true } },
        shop: { select: { key: true } },
      },
    })

    if (!subscription || subscription.customer?.userId !== user.id) {
      return { error: "Suscripción no encontrada." }
    }

    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { isActive, weekday },
    })

    revalidatePath(`/${subscription.shop?.key}/subscriptions`)

    return { success: true }
  } catch (error) {
    console.error("Error actualizando la suscripción:", error)
    return { error: "Hubo un error al actualizar la suscripción." }
  }
}

/** Elimina la suscripción. Los pedidos ya generados no se tocan. */
export async function deleteSubscription({
  subscriptionId,
}: {
  subscriptionId: string
}) {
  const session = await verifySession()
  const user = session?.user

  if (!user) {
    return { error: "No autorizado." }
  }

  try {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        customer: { select: { userId: true } },
        shop: { select: { key: true } },
      },
    })

    if (!subscription || subscription.customer?.userId !== user.id) {
      return { error: "Suscripción no encontrada." }
    }

    await prisma.subscription.delete({ where: { id: subscriptionId } })

    revalidatePath(`/${subscription.shop?.key}/subscriptions`)

    return { success: true }
  } catch (error) {
    console.error("Error eliminando la suscripción:", error)
    return { error: "Hubo un error al eliminar la suscripción." }
  }
}

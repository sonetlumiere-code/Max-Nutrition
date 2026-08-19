"use server"

import { DayOfWeek, PaymentMethod, ShippingMethod } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { verifySession } from "@/lib/auth/verify-session"
import prisma from "@/lib/db/db"
import {
  PREAPPROVAL_STATUS,
  createPreapproval,
  updatePreapprovalStatus,
} from "@/lib/mercado-pago/preapproval"

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
        customer: {
          select: {
            id: true,
            userId: true,
            user: { select: { email: true } },
          },
        },
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

    // Con Mercado Pago el débito es automático por un monto fijo: el del
    // pedido que se está repitiendo. Es el importe que el cliente autoriza.
    const isAutomatic = order.paymentMethod === PaymentMethod.MERCADO_PAGO
    const payerEmail = order.customer.user?.email

    if (isAutomatic && !payerEmail) {
      return {
        error:
          "Necesitamos tu email para el débito automático. Completá tus datos y volvé a intentar.",
      }
    }

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
        amount: isAutomatic ? order.total : null,
        items: { create: items },
      },
    })

    let authorizationUrl: string | undefined

    if (isAutomatic && payerEmail) {
      const preapproval = await createPreapproval({
        subscriptionId: subscription.id,
        payerEmail,
        amount: order.total,
        shopKey: order.shop?.key ?? "",
      })

      if (preapproval.error || !preapproval.success) {
        // Sin autorización de cobro la suscripción no puede debitar, así que
        // no se deja a medias: se borra y el cliente vuelve a intentar.
        await prisma.subscription.delete({ where: { id: subscription.id } })
        return { error: preapproval.error }
      }

      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          mercadoPagoPreapprovalId: preapproval.success.preapprovalId,
          preapprovalStatus: PREAPPROVAL_STATUS.PENDING,
          // Hasta que el cliente autorice la tarjeta no se generan pedidos.
          isActive: false,
        },
      })

      authorizationUrl = preapproval.success.authorizationUrl
    }

    revalidatePath(`/${order.shop?.key}/subscriptions`)

    return { success: { subscriptionId: subscription.id, authorizationUrl } }
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

    // Pausar o reanudar tiene que reflejarse en Mercado Pago antes que acá:
    // si solo se pausara localmente, el débito seguiría corriendo.
    if (subscription.mercadoPagoPreapprovalId && isActive !== undefined) {
      // Reanudar una preaprobación que el cliente nunca autorizó no
      // corresponde: sigue pendiente hasta que la autorice.
      if (isActive && subscription.preapprovalStatus === PREAPPROVAL_STATUS.PENDING) {
        return {
          error:
            "Primero tenés que autorizar el débito automático con tu tarjeta.",
        }
      }

      const target = isActive
        ? PREAPPROVAL_STATUS.AUTHORIZED
        : PREAPPROVAL_STATUS.PAUSED

      const res = await updatePreapprovalStatus({
        preapprovalId: subscription.mercadoPagoPreapprovalId,
        status: target,
      })

      if (res.error) {
        return { error: res.error }
      }

      await prisma.subscription.update({
        where: { id: subscriptionId },
        data: { preapprovalStatus: target },
      })
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

    // La cancelación en Mercado Pago va primero y es bloqueante: borrar acá
    // sin cancelar allá dejaría al cliente debitado sin forma de detenerlo
    // desde la aplicación.
    if (subscription.mercadoPagoPreapprovalId) {
      const res = await updatePreapprovalStatus({
        preapprovalId: subscription.mercadoPagoPreapprovalId,
        status: PREAPPROVAL_STATUS.CANCELLED,
      })

      if (res.error) {
        return {
          error:
            "No pudimos cancelar el débito automático con Mercado Pago. Probá de nuevo en unos minutos.",
        }
      }
    }

    await prisma.subscription.delete({ where: { id: subscriptionId } })

    revalidatePath(`/${subscription.shop?.key}/subscriptions`)

    return { success: true }
  } catch (error) {
    console.error("Error eliminando la suscripción:", error)
    return { error: "Hubo un error al eliminar la suscripción." }
  }
}

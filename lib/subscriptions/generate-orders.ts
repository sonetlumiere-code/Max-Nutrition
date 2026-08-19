import "server-only"

import { ShippingMethod } from "@prisma/client"
import { checkPromotion } from "@/actions/promotions/check-promotion"
import { getShippingZone } from "@/data/shipping-zones"
import prisma from "@/lib/db/db"
import { sendOrderDetailsEmail } from "@/lib/mail/mail"
import { calculateSubtotal, calculateTotal } from "@/lib/orders/pricing"
import { isSubscriptionDue } from "@/helpers/subscriptions"
import { isPreapprovalActive } from "@/lib/mercado-pago/subscription-events"
import { PopulatedOrder, PopulatedProduct } from "@/types/types"

export type SubscriptionRunResult = {
  processed: number
  created: number
  skipped: { subscriptionId: string; reason: string }[]
}

/**
 * Genera los pedidos de las suscripciones que vencen hoy.
 *
 * Los productos y los precios se releen de la base en cada corrida: la
 * suscripción guarda qué se pide, no cuánto costaba cuando se creó. Si un
 * producto dejó de estar disponible se omite, y si no queda ninguno la
 * suscripción se saltea en vez de generar un pedido vacío.
 */
export const generateSubscriptionOrders = async (
  now: Date = new Date()
): Promise<SubscriptionRunResult> => {
  const subscriptions = await prisma.subscription.findMany({
    where: { isActive: true },
    include: {
      items: true,
      customer: { include: { user: { select: { email: true } } } },
      shop: true,
      address: true,
    },
  })

  const result: SubscriptionRunResult = {
    processed: 0,
    created: 0,
    skipped: [],
  }

  for (const subscription of subscriptions) {
    if (!isSubscriptionDue(subscription, now)) continue

    // Doble control: una suscripción con débito automático solo produce
    // pedidos si Mercado Pago tiene la autorización vigente.
    if (
      subscription.mercadoPagoPreapprovalId &&
      !isPreapprovalActive(subscription.preapprovalStatus)
    ) {
      result.skipped.push({
        subscriptionId: subscription.id,
        reason: `Débito automático no autorizado (${subscription.preapprovalStatus}).`,
      })
      continue
    }

    result.processed += 1

    try {
      const products = (await prisma.product.findMany({
        where: {
          id: { in: subscription.items.map((item) => item.productId) },
          show: true,
          stock: true,
        },
        include: { categories: true },
      })) as PopulatedProduct[]

      const availableById = new Map(
        products.map((product) => [product.id, product])
      )

      const populatedItems = subscription.items
        .map((item) => {
          const product = availableById.get(item.productId)
          return product
            ? { product, quantity: item.quantity, withSalt: item.withSalt }
            : null
        })
        .filter(Boolean) as {
        product: PopulatedProduct
        quantity: number
        withSalt: boolean
      }[]

      if (!populatedItems.length) {
        result.skipped.push({
          subscriptionId: subscription.id,
          reason: "Ningún producto de la suscripción está disponible.",
        })
        continue
      }

      const subtotal = calculateSubtotal(populatedItems)

      const { appliedPromotions, finalPrice } = await checkPromotion({
        items: populatedItems,
        shopCategory: subscription.shop.shopCategory,
      })

      let shippingCost = 0

      if (subscription.shippingMethod === ShippingMethod.DELIVERY) {
        if (!subscription.address) {
          result.skipped.push({
            subscriptionId: subscription.id,
            reason: "La suscripción no tiene dirección de envío.",
          })
          continue
        }

        const shippingZone = await getShippingZone({
          where: { locality: subscription.address.locality, isActive: true },
        })

        if (!shippingZone) {
          result.skipped.push({
            subscriptionId: subscription.id,
            reason: `Sin envíos disponibles para ${subscription.address.locality}.`,
          })
          continue
        }

        shippingCost = shippingZone.cost || 0
      }

      const order = await prisma.order.create({
        data: {
          customerId: subscription.customerId,
          customerAddressId:
            subscription.shippingMethod === ShippingMethod.DELIVERY
              ? subscription.customerAddressId
              : null,
          shippingMethod: subscription.shippingMethod,
          shippingCost,
          paymentMethod: subscription.paymentMethod,
          taxCost: 0,
          subtotal,
          total: calculateTotal(finalPrice, shippingCost),
          shopBranchId:
            subscription.shippingMethod === ShippingMethod.TAKE_AWAY
              ? subscription.shopBranchId
              : null,
          shopId: subscription.shopId,
          items: {
            create: populatedItems.map((item) => ({
              productId: item.product.id,
              quantity: item.quantity,
              withSalt: item.withSalt,
              unitPrice: item.product.price,
            })),
          },
          appliedPromotions: {
            create: appliedPromotions.map((promotion) => ({
              promotionId: promotion.id,
              promotionName: promotion.name,
              promotionDiscountType: promotion.discountType,
              promotionDiscount: promotion.discount,
              appliedTimes: promotion.appliedTimes,
              discountAmount: promotion.discountAmount,
            })),
          },
        },
        include: {
          address: true,
          appliedPromotions: true,
          customer: { include: { user: { select: { email: true, name: true } } } },
          items: { include: { product: true } },
        },
      })

      // Se marca la corrida antes de notificar: si el mail falla, el pedido ya
      // está hecho y no debe volver a generarse.
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { lastRunAt: now },
      })

      result.created += 1

      const email = subscription.customer?.user?.email

      if (email) {
        try {
          await sendOrderDetailsEmail({
            email,
            order: order as PopulatedOrder,
            orderLink: `${subscription.shop.key}/customer-orders-history`,
          })
        } catch (error) {
          console.error(
            `Error avisando el pedido de la suscripción ${subscription.id}:`,
            error
          )
        }
      }
    } catch (error) {
      console.error(
        `Error generando el pedido de la suscripción ${subscription.id}:`,
        error
      )
      result.skipped.push({
        subscriptionId: subscription.id,
        reason: "Error inesperado al generar el pedido.",
      })
    }
  }

  return result
}

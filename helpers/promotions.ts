import { Category } from "@prisma/client"
import {
  PopulatedProduct,
  PopulatedPromotion,
  PromotionToApply,
} from "@/types/types"
import { calculateSubtotal, roundMoney } from "@/lib/orders/pricing"

/**
 * Qué promoción se aplica a un carrito y cuánto descuenta.
 *
 * Las promociones no se apilan: cuando varias califican gana la que más
 * descuenta en pesos, no la que tiene el número más grande. La aritmética sale
 * de `lib/orders/pricing.ts`, que es la misma que usa el pedido para cobrar.
 */

export function calculatePromotions({
  items,
  promotions,
}: {
  items: {
    product: PopulatedProduct
    quantity: number
  }[]
  promotions: PopulatedPromotion[]
}) {
  const subtotalPrice = calculateSubtotal(items)

  let totalDiscountAmount = 0
  let appliedPromotions: PromotionToApply[] = []

  if (!promotions?.length) {
    return {
      appliedPromotions,
      subtotalPrice,
      totalDiscountAmount,
      finalPrice: subtotalPrice,
    }
  }

  const categoryCount: Record<string, number> = {}

  items.forEach((item) => {
    const itemQuantity = item.quantity
    item.product.categories?.forEach((category: Category) => {
      const categoryId = category.id
      categoryCount[categoryId] =
        (categoryCount[categoryId] || 0) + itemQuantity
    })
  })

  const candidates: PromotionToApply[] = []

  promotions.forEach((promotion) => {
    if (!promotion.categories?.length) return

    // Condición: el carrito debe cubrir la cantidad requerida de cada categoría.
    let applicable = true
    let maxIterations = Infinity

    promotion.categories.forEach(({ categoryId, quantity }) => {
      const availableQuantity = categoryCount[categoryId] || 0
      const iterations = Math.floor(availableQuantity / quantity)

      if (iterations === 0) {
        applicable = false
      }
      maxIterations = Math.min(maxIterations, iterations)
    })

    if (!applicable) return

    if (promotion.discountType === "FIXED") {
      const cappedIterations = Math.min(
        maxIterations,
        promotion.maxApplicableTimes || Infinity
      )

      if (cappedIterations > 0) {
        candidates.push({
          ...promotion,
          appliedTimes: cappedIterations,
          discountAmount: cappedIterations * promotion.discount,
        })
      }
    }

    if (promotion.discountType === "PERCENTAGE") {
      // El porcentaje se aplica una vez, sobre el subtotal de los productos
      // que pertenecen a las categorías de la promoción.
      const promotionCategoryIds = new Set(
        promotion.categories.map((category) => category.categoryId)
      )

      const qualifyingSubtotal = calculateSubtotal(
        items.filter((item) =>
          item.product.categories?.some((category: Category) =>
            promotionCategoryIds.has(category.id)
          )
        )
      )

      const discountAmount = roundMoney(
        qualifyingSubtotal * (promotion.discount / 100)
      )

      if (discountAmount > 0) {
        candidates.push({
          ...promotion,
          appliedTimes: 1,
          discountAmount,
        })
      }
    }
  })

  // Las promociones no se apilan: se aplica solo la de mayor descuento.
  const bestPromotion = candidates.reduce<PromotionToApply | null>(
    (best, candidate) =>
      candidate.discountAmount > (best?.discountAmount ?? 0) ? candidate : best,
    null
  )

  if (bestPromotion) {
    appliedPromotions = [bestPromotion]
    totalDiscountAmount = bestPromotion.discountAmount
  }

  // El descuento nunca puede superar el subtotal: el precio final no baja de 0.
  const finalPrice = roundMoney(Math.max(0, subtotalPrice - totalDiscountAmount))

  return {
    appliedPromotions,
    subtotalPrice,
    totalDiscountAmount,
    finalPrice,
  }
}

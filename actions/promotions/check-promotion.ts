"use server"

import { getPromotions } from "@/data/promotions"
import { PromotionToApply, PopulatedProduct } from "@/types/types"
import { Category } from "@prisma/client"

type CheckPromotionProps = {
  items: {
    product: PopulatedProduct
    quantity: number
  }[]
  subtotal: number
}

export async function checkPromotion({ items, subtotal }: CheckPromotionProps) {
  const promotions = await getPromotions({ include: { categories: true } })

  const subtotalPrice = subtotal
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

  promotions.forEach((promotion) => {
    if (promotion.discountType === "FIXED" && promotion.categories?.length) {
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

      const cappedIterations = Math.min(
        maxIterations,
        promotion.maxApplicableTimes || Infinity
      )

      if (applicable && cappedIterations > 0) {
        const discountAmount = cappedIterations * promotion.discount
        totalDiscountAmount += discountAmount

        appliedPromotions.push({
          ...promotion,
          appliedTimes: cappedIterations,
        })
      }
    }
  })

  const finalPrice = subtotalPrice - totalDiscountAmount

  return {
    appliedPromotions,
    subtotalPrice,
    totalDiscountAmount,
    finalPrice,
  }
}

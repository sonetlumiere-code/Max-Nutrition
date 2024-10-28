"use server"

import { CartItem } from "@/components/cart-provider"
import { getPromotions } from "@/data/promotions"
import { Category } from "@prisma/client"

type CheckPromotionProps = {
  items: CartItem[]
  subtotal: number
}

export async function checkPromotion({ items, subtotal }: CheckPromotionProps) {
  const promotions = await getPromotions({ include: { categories: true } })

  const initialPromotion = null
  const subtotalPrice = subtotal
  let finalPrice = subtotalPrice

  if (!promotions?.length) {
    return { appliedPromotion: initialPromotion, subtotalPrice, finalPrice }
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

  for (const promotion of promotions) {
    const isEligible = promotion.categories?.every((requirement) => {
      const { categoryId, quantity } = requirement
      return categoryCount[categoryId] >= quantity
    })

    if (isEligible) {
      const discountAmount =
        promotion.discountType === "Fixed"
          ? promotion.discount
          : promotion.discountType === "Percentage"
          ? (subtotalPrice * promotion.discount) / 100
          : 0
      finalPrice = subtotalPrice - discountAmount

      return {
        appliedPromotion: promotion,
        subtotalPrice,
        finalPrice,
      }
    }
  }

  return { appliedPromotion: initialPromotion, subtotalPrice, finalPrice }
}

"use client"

import { useCart } from "@/components/cart-provider"
import { Category } from "@prisma/client"
import { useMemo } from "react"
import { useGetPromotions } from "./use-get-promotions"

export function usePromotion() {
  const { items, getSubtotalPrice } = useCart()

  const { promotions, isLoadingPromotions } = useGetPromotions()

  const { appliedPromotion, subtotalPrice, discountAmount, finalPrice } =
    useMemo(() => {
      const initialPromotion = null
      const subtotalPrice = getSubtotalPrice()
      let discountAmount = 0
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
          discountAmount =
            promotion.discountType === "Fixed"
              ? promotion.discount
              : promotion.discountType === "Percentage"
              ? (subtotalPrice * promotion.discount) / 100
              : 0
          finalPrice = subtotalPrice - discountAmount

          return {
            appliedPromotion: promotion,
            subtotalPrice,
            discountAmount,
            finalPrice,
          }
        }
      }

      return {
        promotions,
        appliedPromotion: initialPromotion,
        subtotalPrice,
        discountAmount,
        finalPrice,
      }
    }, [items, promotions, getSubtotalPrice])

  return {
    promotions,
    isLoadingPromotions,
    appliedPromotion,
    subtotalPrice,
    discountAmount,
    finalPrice,
  }
}

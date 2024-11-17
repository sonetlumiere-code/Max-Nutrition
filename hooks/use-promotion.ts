"use client"

import { useCart } from "@/components/cart-provider"
import useSWR from "swr"
import { PopulatedPromotion } from "@/types/types"
import { Category } from "@prisma/client"
import { getPromotions } from "@/data/promotions"
import { useMemo } from "react"

const fetcher = async () => {
  const promotions = await getPromotions({ include: { categories: true } })
  return promotions
}

export function usePromotion() {
  const { items, getSubtotalPrice } = useCart()

  const {
    data: promotions = [],
    error,
    isLoading,
  } = useSWR<PopulatedPromotion[] | null>("/api/promotions", fetcher)

  if (error) {
    console.error("Failed to fetch promotions:", error)
  }

  const { appliedPromotion, subtotalPrice, discountAmount, finalPrice } =
    useMemo(() => {
      const initialPromotion = null
      const subtotalPrice = getSubtotalPrice()
      let discountAmount = 0
      let finalPrice = subtotalPrice

      if (!promotions?.length)
        return { appliedPromotion: initialPromotion, subtotalPrice, finalPrice }

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
        appliedPromotion: initialPromotion,
        subtotalPrice,
        discountAmount,
        finalPrice,
      }
    }, [items, promotions, getSubtotalPrice])

  return {
    appliedPromotion,
    isLoading,
    subtotalPrice,
    discountAmount,
    finalPrice,
  }
}

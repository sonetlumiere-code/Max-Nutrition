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
  const { items } = useCart()

  const { data: promotions = [], error } = useSWR<PopulatedPromotion[] | null>(
    "/api/promotions",
    fetcher
  )

  if (error) {
    console.error("Failed to fetch promotions:", error)
  }

  const appliedPromotion = useMemo(() => {
    const initialPromotion = { discount: 0, discountType: null }

    if (!promotions?.length) return initialPromotion

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
        return {
          discount: promotion.discount,
          discountType: promotion.discountType,
        }
      }
    }

    return initialPromotion
  }, [items, promotions])

  return { appliedPromotion }
}

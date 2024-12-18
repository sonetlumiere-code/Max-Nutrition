"use client"

import { useCart } from "@/components/cart-provider"
import { useMemo } from "react"
import { useGetPromotions } from "./use-get-promotions"
import { calculatePromotions } from "@/helpers/helpers"

export function usePromotion() {
  const { items, getSubtotalPrice } = useCart()
  const { promotions, isLoadingPromotions } = useGetPromotions()

  const subtotalPrice = getSubtotalPrice()

  const { appliedPromotions, totalDiscountAmount, finalPrice } = useMemo(() => {
    return calculatePromotions({
      items,
      promotions: promotions || [],
      subtotal: subtotalPrice,
    })
  }, [items, promotions, subtotalPrice])

  return {
    promotions,
    isLoadingPromotions,
    appliedPromotions,
    subtotalPrice,
    totalDiscountAmount,
    finalPrice,
  }
}

import { calculatePromotions } from "@/helpers/helpers"
import { useMemo } from "react"
import { useGetPromotions } from "./use-get-promotions"
import { LineItem } from "@/types/types"

type UsePromotionProps = {
  items: LineItem[]
}

export function usePromotion({ items }: UsePromotionProps) {
  const { promotions, isLoadingPromotions } = useGetPromotions()

  const { appliedPromotions, totalDiscountAmount, subtotalPrice, finalPrice } =
    useMemo(() => {
      return calculatePromotions({
        items,
        promotions: promotions || [],
      })
    }, [items, promotions])

  return {
    promotions,
    isLoadingPromotions,
    appliedPromotions,
    subtotalPrice,
    totalDiscountAmount,
    finalPrice,
  }
}

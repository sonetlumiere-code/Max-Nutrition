import { calculatePromotions } from "@/helpers/helpers"
import { useMemo } from "react"
import { useGetPromotions } from "./use-get-promotions"
import { LineItem } from "@/types/types"
import { ShopCategory } from "@prisma/client"

type UsePromotionProps = {
  items: LineItem[]
  shopCategory: ShopCategory
}

export function usePromotion({ items, shopCategory }: UsePromotionProps) {
  const { promotions, isLoadingPromotions } = useGetPromotions({ shopCategory })

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

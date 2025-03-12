"use client"

import { getPromotions } from "@/data/promotions"
import { PopulatedPromotion } from "@/types/types"
import { ShopCategory } from "@prisma/client"
import useSWR from "swr"

const fetcher = async ({ shopCategory }: { shopCategory: ShopCategory }) => {
  const promotions = await getPromotions({
    where: { isActive: true, shopCategory },
    include: { categories: true },
  })
  return promotions
}

export const useGetPromotions = ({
  shopCategory,
}: {
  shopCategory: ShopCategory
}) => {
  const {
    data: promotions = [],
    error,
    isLoading: isLoadingPromotions,
  } = useSWR<PopulatedPromotion[] | null>(
    `promotions-${shopCategory}`,
    () => fetcher({ shopCategory }),
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
    }
  )

  if (error) {
    console.error("Failed to fetch promotions:", error)
  }

  return { promotions, error, isLoadingPromotions }
}

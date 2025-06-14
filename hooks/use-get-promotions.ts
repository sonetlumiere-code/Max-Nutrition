"use client"

import { PopulatedPromotion } from "@/types/types"
import { ShopCategory } from "@prisma/client"
import useSWR from "swr"

const fetchPromotions = async ({
  shopCategory,
}: {
  shopCategory: ShopCategory
}): Promise<PopulatedPromotion[] | null> => {
  const params = new URLSearchParams({ shopCategory })

  const res = await fetch(`/api/promotions?${params.toString()}`)

  if (!res.ok) {
    const errorBody = await res.json()
    console.error("Failed to fetch promotions:", errorBody.error)
    return null
  }

  return res.json()
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
    () => fetchPromotions({ shopCategory }),
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

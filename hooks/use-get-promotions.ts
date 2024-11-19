"use client"

import { getPromotions } from "@/data/promotions"
import { PopulatedPromotion } from "@/types/types"
import useSWR from "swr"

const fetcher = async () => {
  const promotions = await getPromotions({
    where: { isActive: true },
    include: { categories: true },
  })
  return promotions
}

export const useGetPromotions = () => {
  const {
    data: promotions = [],
    error,
    isLoading: isLoadingPromotions,
  } = useSWR<PopulatedPromotion[] | null>("promotions", fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
  })

  if (error) {
    console.error("Failed to fetch promotions:", error)
  }

  return { promotions, error, isLoadingPromotions }
}

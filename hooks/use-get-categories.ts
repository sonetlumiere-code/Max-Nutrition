"use client"

import { PopulatedCategory } from "@/types/types"
import { ShopCategory } from "@prisma/client"
import useSWR from "swr"

const fetchCategories = async ({
  shopCategory,
}: {
  shopCategory: ShopCategory
}): Promise<PopulatedCategory[] | null> => {
  const res = await fetch(
    `/api/categories?shopCategory=${encodeURIComponent(shopCategory)}`
  )

  if (!res.ok) {
    const errorRes = await res.json()
    console.error("Failed to fetch categories:", errorRes.error)
    return null
  }

  return res.json()
}

export const useGetCategories = ({
  shopCategory,
  fallbackData,
  onSuccess,
}: {
  shopCategory: ShopCategory
  fallbackData?: PopulatedCategory[] | null
  onSuccess?: (categories: PopulatedCategory[]) => void
}) => {
  const {
    data: categories = fallbackData,
    error,
    isLoading: isLoadingCategories,
  } = useSWR<PopulatedCategory[] | null>(
    `categories-${shopCategory}`,
    () => fetchCategories({ shopCategory }),
    {
      fallbackData,
      revalidateOnMount: false,
      revalidateIfStale: false,
      revalidateOnFocus: true,
      onSuccess: (data) => {
        if (onSuccess && data) {
          onSuccess(data)
        }
      },
    }
  )

  return { categories, error, isLoadingCategories }
}

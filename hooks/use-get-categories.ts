"use client"

import { PopulatedCategory } from "@/types/types"
import { ShopCategory } from "@prisma/client"
import useSWR from "swr"

const fetchCategories = async ({
  shopCategory,
}: {
  shopCategory: ShopCategory
}): Promise<PopulatedCategory[] | null> => {
  const params = new URLSearchParams({ shopCategory })

  const res = await fetch(`/api/categories?${params.toString()}`)

  if (!res.ok) {
    try {
      const errorRes = await res.json()
      console.error("Failed to fetch categories:", errorRes.error)
    } catch {
      console.error("Failed to fetch categories: Unknown error")
    }
    return null
  }

  try {
    return (await res.json()) as PopulatedCategory[]
  } catch {
    console.error("Failed to parse categories response")
    return null
  }
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

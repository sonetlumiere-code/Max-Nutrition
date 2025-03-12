"use client"

import { getCategories } from "@/data/categories"
import { PopulatedCategory } from "@/types/types"
import { ShopCategory } from "@prisma/client"
import useSWR from "swr"

const fetchCategories = async ({
  shopCategory,
}: {
  shopCategory: ShopCategory
}) => {
  const categories = await getCategories({
    where: {
      shopCategory,
    },
    include: {
      products: {
        where: {
          show: true,
        },
        include: {
          categories: true,
        },
      },
      promotions: true,
    },
  })

  return categories
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
  } = useSWR("categories", () => fetchCategories({ shopCategory }), {
    fallbackData,
    revalidateOnMount: false,
    revalidateIfStale: false,
    revalidateOnFocus: true,
    onSuccess: (data) => {
      if (onSuccess && data) {
        onSuccess(data)
      }
    },
  })

  return { categories, error, isLoadingCategories }
}

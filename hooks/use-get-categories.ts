"use client"

import { getCategories } from "@/data/categories"
import { PopulatedCategory } from "@/types/types"
import useSWR from "swr"

const fetchCategories = async () => {
  const categories = await getCategories({
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
  fallbackData,
  onSuccess,
}: {
  fallbackData?: PopulatedCategory[] | null
  onSuccess?: (categories: PopulatedCategory[]) => void
}) => {
  const { data: categories = fallbackData, error } = useSWR(
    "categories",
    fetchCategories,
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

  return { categories, error }
}

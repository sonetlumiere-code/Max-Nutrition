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
}: {
  fallbackData?: PopulatedCategory[] | null
}) => {
  const { data: categories = fallbackData, error } = useSWR(
    "categories",
    fetchCategories,
    {
      fallbackData,
      revalidateOnFocus: true,
    }
  )

  return { categories, error }
}

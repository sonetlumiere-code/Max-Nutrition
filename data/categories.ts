"use server"

import prisma from "@/lib/db/db"
import { PopulatedCategory } from "@/types/types"

export const getCategories = async () => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        products: {
          include: {
            categories: true,
          },
        },
        promotions: true,
      },
    })

    return categories
  } catch (error) {
    console.error(error)
    return null
  }
}

export const getCategory = async (params: {
  where: {
    id?: string
  }
  include?: {
    products?: true
    promotions?: true
  }
}) => {
  try {
    const category = await prisma.category.findFirst({
      ...params,
    })

    return category as PopulatedCategory
  } catch (error) {
    console.error(error)
    return null
  }
}

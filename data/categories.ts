import "server-only"

import prisma from "@/lib/db/db"
import { PopulatedCategory } from "@/types/types"
import { Prisma } from "@prisma/client"

export const getCategories = async (args?: Prisma.CategoryFindManyArgs) => {
  try {
    const categories = await prisma.category.findMany(args)

    return categories as PopulatedCategory[]
  } catch (error) {
    console.error("Error fetching categories:", error)
    return null
  }
}

export const getCategory = async (args: Prisma.CategoryFindFirstArgs) => {
  try {
    const category = await prisma.category.findFirst(args)

    return category as PopulatedCategory
  } catch (error) {
    console.error("Error fetching category:", error)
    return null
  }
}

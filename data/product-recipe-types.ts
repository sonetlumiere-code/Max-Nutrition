import "server-only"

import prisma from "@/lib/db/db"
import { Prisma } from "@prisma/client"

export const getProductRecipeTypes = async (
  args?: Prisma.ProductRecipeTypeFindManyArgs
) => {
  try {
    const productRecipeTypes = await prisma.productRecipeType.findMany(args)

    return productRecipeTypes
  } catch (error) {
    console.error("Error fetching product recipe types:", error)
    return null
  }
}

export const getProductRecipeType = async (
  args: Prisma.ProductRecipeTypeFindFirstArgs
) => {
  try {
    const productRecipeType = await prisma.productRecipeType.findFirst(args)

    return productRecipeType
  } catch (error) {
    console.error("Error fetching product recipe type:", error)
    return null
  }
}

"server-only"

import prisma from "@/lib/db/db"
import { PopulatedProduct } from "@/types/types"
import { Prisma } from "@prisma/client"

export const getProducts = async (args?: Prisma.ProductFindManyArgs) => {
  try {
    const products = await prisma.product.findMany(args)

    return products as PopulatedProduct[]
  } catch (error) {
    console.error("Error fetching products:", error)
    return null
  }
}

export const getProduct = async (args: Prisma.ProductFindFirstArgs) => {
  try {
    const product = await prisma.product.findFirst(args)

    return product as PopulatedProduct
  } catch (error) {
    console.error("Error fetching product:", error)
    return null
  }
}

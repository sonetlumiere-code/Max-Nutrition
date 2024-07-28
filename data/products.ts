"use server"

import prisma from "@/lib/db/db"
import { PopulatedProduct } from "@/types/types"

export const getProducts = async () => {
  try {
    const products = await prisma.product.findMany()

    return products
  } catch (error) {
    console.error(error)
    return null
  }
}

export const getProduct = async (params: {
  where: {
    id?: string
    description?: string
  }
  include?: {
    recipe?: boolean
  }
}) => {
  try {
    const product = await prisma.product.findFirst({
      ...params,
    })

    return product as PopulatedProduct
  } catch (error) {
    console.error(error)
    return null
  }
}

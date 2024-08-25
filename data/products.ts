"use server"

import prisma from "@/lib/db/db"
import { PopulatedProduct } from "@/types/types"

export const getProducts = async (params?: {
  include?: {
    categories?: boolean
  }
}) => {
  try {
    const products = await prisma.product.findMany({
      ...params,
    })

    return products as PopulatedProduct[]
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
    categories?: boolean
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

export const getProductsByIds = async (ids: string[]) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    })

    return products
  } catch (error) {
    console.error("Error fetching products by IDs:", error)
    return null
  }
}

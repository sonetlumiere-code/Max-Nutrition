"use server"

import prisma from "@/lib/db/db"
import { PopulatedProduct } from "@/types/types"

export const getProducts = async (params?: {
  where?: {
    id?: {
      in?: string[]
    }
    show?: boolean
  }
  include?: {
    categories?: boolean
  }
}): Promise<PopulatedProduct[] | null> => {
  try {
    const products = await prisma.product.findMany({
      where: params?.where || {},
      include: params?.include || {},
    })

    return products as PopulatedProduct[]
  } catch (error) {
    console.error("Error fetching products:", error)
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

"use server"

import prisma from "@/lib/db/db"

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
}) => {
  try {
    const product = await prisma.product.findFirst({
      ...params,
      // include: {},
    })

    return product
  } catch (error) {
    console.error(error)
    return null
  }
}

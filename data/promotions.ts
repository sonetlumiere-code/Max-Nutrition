"use server"

import prisma from "@/lib/db/db"
import { PopulatedPromotion } from "@/types/types"

export const getPromotions = async (params?: {
  include?: {
    categories?: boolean
  }
}) => {
  try {
    const promotions = await prisma.promotion.findMany({
      ...params,
    })

    return promotions as PopulatedPromotion[]
  } catch (error) {
    console.error(error)
    return null
  }
}

export const getPromotion = async (params: {
  where: {
    id?: string
  }
  include?: {
    categories?: boolean
  }
}) => {
  try {
    const promotion = await prisma.promotion.findFirst({
      ...params,
    })

    return promotion as PopulatedPromotion
  } catch (error) {
    console.error(error)
    return null
  }
}

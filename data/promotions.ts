"use server"

import prisma from "@/lib/db/db"
import { PopulatedPromotion } from "@/types/types"
import { Prisma } from "@prisma/client"

export const getPromotions = async (args?: Prisma.PromotionFindManyArgs) => {
  try {
    const promotions = await prisma.promotion.findMany(args)

    return promotions as PopulatedPromotion[]
  } catch (error) {
    console.error("Error fetching promotions:", error)
    return null
  }
}

export const getPromotion = async (args: Prisma.PromotionFindFirstArgs) => {
  try {
    const promotion = await prisma.promotion.findFirst(args)

    return promotion as PopulatedPromotion
  } catch (error) {
    console.error("Error fetching promotion:", error)
    return null
  }
}

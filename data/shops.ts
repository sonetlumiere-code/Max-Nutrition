"server-only"

import prisma from "@/lib/db/db"
import { PopulatedShop } from "@/types/types"
import { Prisma } from "@prisma/client"

export const getShops = async (args?: Prisma.ShopFindManyArgs) => {
  try {
    const shops = await prisma.shop.findMany(args)

    return shops
  } catch (error) {
    console.error("Error fetching shops:", error)
    return null
  }
}

export const getShop = async (args: Prisma.ShopFindFirstArgs) => {
  try {
    const shop = await prisma.shop.findFirst(args)

    return shop as PopulatedShop
  } catch (error) {
    console.error("Error fetching shop:", error)
    return null
  }
}

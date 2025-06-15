import "server-only"

import prisma from "@/lib/db/db"
import { PopulatedShopBranch } from "@/types/types"
import { Prisma } from "@prisma/client"

export const getShopBranches = async (args?: Prisma.ShopBranchFindManyArgs) => {
  try {
    const shopBranches = await prisma.shopBranch.findMany(args)

    return shopBranches as PopulatedShopBranch[]
  } catch (error) {
    console.error("Error fetching shop branches:", error)
    return null
  }
}

export const getShopBranch = async (args: Prisma.ShopBranchFindFirstArgs) => {
  try {
    const shopBranch = await prisma.shopBranch.findFirst(args)

    return shopBranch as PopulatedShopBranch
  } catch (error) {
    console.error("Error fetching shop branch:", error)
    return null
  }
}

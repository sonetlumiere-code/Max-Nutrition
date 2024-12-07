"use server"

import prisma from "@/lib/db/db"
import { Prisma } from "@prisma/client"

export const getShopBranches = async (args?: Prisma.ShopBranchFindManyArgs) => {
  try {
    const shopBranches = await prisma.shopBranch.findMany(args)

    return shopBranches
  } catch (error) {
    console.error(error)
    return null
  }
}

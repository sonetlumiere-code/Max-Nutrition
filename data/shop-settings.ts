"use server"

import prisma from "@/lib/db/db"
import { Prisma } from "@prisma/client"

export const getShopSettings = async (
  args: Prisma.ShopSettingsFindUniqueArgs
) => {
  try {
    const settings = await prisma.shopSettings.findUnique(args)

    return settings
  } catch (error) {
    console.error(error)
    return null
  }
}

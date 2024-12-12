"use server"

import prisma from "@/lib/db/db"
import { PopulatedShopSettings } from "@/types/types"
import { Prisma } from "@prisma/client"

export const getShopSettings = async (
  args: Prisma.ShopSettingsFindUniqueArgs
) => {
  try {
    const settings = await prisma.shopSettings.findUnique(args)

    return settings as PopulatedShopSettings
  } catch (error) {
    console.error(error)
    return null
  }
}

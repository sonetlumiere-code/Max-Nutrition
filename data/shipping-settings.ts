"use server"

import prisma from "@/lib/db/db"
import { PopulatedShippingSettings } from "@/types/types"
import { Prisma } from "@prisma/client"

export const getShippingSettings = async (
  args: Prisma.ShippingSettingsFindUniqueArgs
) => {
  try {
    const shippingSettings = await prisma.shippingSettings.findUnique(args)

    return shippingSettings as PopulatedShippingSettings
  } catch (error) {
    console.error(error)
    return null
  }
}

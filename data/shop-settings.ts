"use server"

import prisma from "@/lib/db/db"

export const getShopSettings = async () => {
  try {
    const shopSettings = await prisma.shopSettings.findUnique({
      where: { id: "1" },
    })

    return shopSettings
  } catch (error) {
    console.error(error)
    return null
  }
}

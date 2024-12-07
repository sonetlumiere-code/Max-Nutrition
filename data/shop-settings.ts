"use server"

import prisma from "@/lib/db/db"

export const getShopSettings = async () => {
  try {
    const settings = await prisma.shopSettings.findUnique({
      where: { id: "1" },
      include: {
        branches: {
          include: {
            operationalHours: true,
          },
        },
      },
    })

    return settings
  } catch (error) {
    console.error(error)
    return null
  }
}

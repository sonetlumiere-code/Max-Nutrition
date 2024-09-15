"use server"

import prisma from "@/lib/db/db"

export const getShippingSettings = async () => {
  try {
    const shippingSettings = await prisma.shippingSettings.findUnique({
      where: { id: "1" },
    })

    return shippingSettings
  } catch (error) {
    console.error(error)
    return null
  }
}

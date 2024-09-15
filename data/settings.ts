"use server"

import prisma from "@/lib/db/db"

export const getSettings = async () => {
  try {
    const settings = await prisma.settings.findUnique({
      where: { id: "1" },
    })

    return settings
  } catch (error) {
    console.error(error)
    return null
  }
}

"use server"

import prisma from "@/lib/db/db"

export const getShippingZones = async (params?: {
  where: {
    isActive?: boolean
  }
}) => {
  try {
    const shippingZones = await prisma.shippingZone.findMany({
      ...params,
    })

    return shippingZones
  } catch (error) {
    console.error(error)
    return null
  }
}

export const getShippingZone = async (params: {
  where: {
    id?: string
    locality?: string
    isActive?: boolean
  }
}) => {
  try {
    const shippingZone = await prisma.shippingZone.findFirst({
      ...params,
    })

    return shippingZone
  } catch (error) {
    console.error(error)
    return null
  }
}

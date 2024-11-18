"use server"

import prisma from "@/lib/db/db"
import { Prisma } from "@prisma/client"

export const getShippingZones = async (
  args?: Prisma.ShippingZoneFindManyArgs
) => {
  try {
    const shippingZones = await prisma.shippingZone.findMany(args)

    return shippingZones
  } catch (error) {
    console.error("Error fetching shipping zones:", error)
    return null
  }
}

export const getShippingZone = async (
  args: Prisma.ShippingZoneFindFirstArgs
) => {
  try {
    const shippingZone = await prisma.shippingZone.findFirst(args)

    return shippingZone
  } catch (error) {
    console.error("Error fetching shipping zone:", error)
    return null
  }
}

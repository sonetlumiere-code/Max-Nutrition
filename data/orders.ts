"use server"

import prisma from "@/lib/db/db"
import { PopulatedOrder } from "@/types/types"
import { Prisma } from "@prisma/client"

export const getOrders = async (args?: Prisma.OrderFindManyArgs) => {
  try {
    const orders = await prisma.order.findMany(args)

    return orders as PopulatedOrder[]
  } catch (error) {
    console.error("Error fetching orders:", error)
    return null
  }
}

export async function getOrder(args: Prisma.OrderFindFirstArgs) {
  try {
    const order = await prisma.order.findFirst(args)

    if (!order) {
      return null
    }

    return order as PopulatedOrder
  } catch (error) {
    console.error("Error obteniendo orden:", error)
    return null
  }
}

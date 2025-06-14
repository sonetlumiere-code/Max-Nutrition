"server-only"

import { hasPermission } from "@/helpers/helpers"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/db/db"
import { PopulatedOrder } from "@/types/types"
import { Prisma } from "@prisma/client"

export const getOrders = async (args?: Prisma.OrderFindManyArgs) => {
  const session = await auth()

  if (!session) {
    return null
  }

  if (!hasPermission(session.user, "view:orders")) {
    return null
  }

  try {
    const orders = await prisma.order.findMany(args)

    return orders as PopulatedOrder[]
  } catch (error) {
    console.error("Error fetching orders:", error)
    return null
  }
}

export async function getOrder(args: Prisma.OrderFindFirstArgs) {
  const session = await auth()

  if (!session) {
    return null
  }

  if (!hasPermission(session.user, "view:orders")) {
    return null
  }

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

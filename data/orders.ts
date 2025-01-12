"use server"

import { auth } from "@/lib/auth/auth"
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

export async function getOrder(orderId: string) {
  try {
    const session = await auth()

    if (!session?.user) {
      return { error: "No autorizado" }
    }

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        customer: {
          userId: session.user.id,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: {
          include: {
            user: true,
            address: true,
          },
        },
        address: true,
      },
    })

    if (!order) {
      return { error: "Orden no encontrada" }
    }

    return { success: true, order }
  } catch (error) {
    console.error("Error obteniendo orden:", error)
    return { error: "Error al obtener la orden" }
  }
}

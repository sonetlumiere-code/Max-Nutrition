"use server"

import prisma from "@/lib/db/db"
import { PopulatedOrder } from "@/types/types"

export const getOrders = async (): Promise<PopulatedOrder[] | null> => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: {
          include: {
            user: {
              select: {
                email: true,
                image: true,
              },
            },
          },
        },
        address: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return orders as PopulatedOrder[]
  } catch (error) {
    console.error("Error fetching orders:", error)
    return null
  }
}

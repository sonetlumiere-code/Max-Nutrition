"use server"

import prisma from "@/lib/db/db"
import { PopulatedOrder } from "@/types/types"

export const getOrders = async () => {
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
    })

    return orders as PopulatedOrder[]
  } catch (error) {
    console.error(error)
    return null
  }
}

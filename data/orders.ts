"use server"

import prisma from "@/lib/db/db"

export const getOrders = async () => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: true,
      },
    })

    return orders
  } catch (error) {
    console.error(error)
    return null
  }
}

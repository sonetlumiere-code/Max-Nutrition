"use server"

import prisma from "@/lib/db/db"
import { PopulatedCustomer } from "@/types/types"

export const getCustomer = async (
  userId: string
): Promise<PopulatedCustomer | null> => {
  try {
    const customer = await prisma.customer.findFirst({
      where: {
        userId,
      },
      include: {
        address: true,
        user: {
          select: {
            email: true,
            name: true,
          },
        },
        orders: {
          // take: 5,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    })

    return customer
  } catch (error) {
    console.error("Error fetching or creating customer:", error)
    return null
  }
}

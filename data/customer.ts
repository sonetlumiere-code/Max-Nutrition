"use server"

import { createCustomer } from "@/actions/customer/create-customer"
import prisma from "@/lib/db/db"
import { PopulatedCustomer } from "@/types/types"
import { Role } from "@prisma/client"

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

    if (customer) {
      return customer
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    })

    if (!user || user.role !== Role.USER) {
      return null
    }

    const newCustomer = await createCustomer({
      userId,
    })

    if (newCustomer.success) {
      return newCustomer.success
    }

    return null
  } catch (error) {
    console.error("Error fetching or creating customer:", error)
    return null
  }
}

export const getCustomers = async () => {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        user: {
          select: { email: true, image: true, name: true, createdAt: true },
        },
      },
    })
    return customers
  } catch (error) {
    console.error(error)
    return null
  }
}

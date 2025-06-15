import "server-only"

import prisma from "@/lib/db/db"
import { PopulatedCustomer } from "@/types/types"
import { Prisma } from "@prisma/client"

export const getCustomers = async (args?: Prisma.CustomerFindManyArgs) => {
  try {
    const customers = await prisma.customer.findMany(args)

    return customers as PopulatedCustomer[]
  } catch (error) {
    console.error("Error fetching customers:", error)
    return null
  }
}

export const getCustomer = async (args: Prisma.CustomerFindFirstArgs) => {
  try {
    const customer = await prisma.customer.findFirst(args)

    return customer as PopulatedCustomer
  } catch (error) {
    console.error("Error fetching customer:", error)
    return null
  }
}

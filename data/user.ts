"use server"

import prisma from "@/lib/db/db"
import { PopulatedUser } from "@/types/types"
import { Prisma } from "@prisma/client"

export const getUser = async (args: Prisma.UserFindFirstArgs) => {
  try {
    const user = await prisma.user.findFirst(args)

    return user as PopulatedUser
  } catch (error) {
    console.error("Error fetching user:", error)
    return null
  }
}

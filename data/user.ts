"use server"

import prisma from "@/lib/db/db"
import { User } from "@prisma/client"

export const getUser = async (params: {
  where: {
    id?: string
    email?: string
  }
}): Promise<User | null> => {
  try {
    const user = await prisma.user.findFirst(params)

    return user
  } catch (error) {
    console.error(error)
    return null
  }
}

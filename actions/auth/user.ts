"use server"

import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/db/db"
import { User } from "@prisma/client"

export const updateUser = async (data: Partial<User>) => {
  try {
    const session = await auth()

    const userUpdated = await prisma.user.update({
      where: { id: session?.user.id },
      data,
    })

    return userUpdated
  } catch (error) {
    console.error(error)
    return null
  }
}

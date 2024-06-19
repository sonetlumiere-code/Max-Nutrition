"use server"

import prisma from "@/lib/db/db"
import { User } from "@prisma/client"

export const updateUser = async (
  id: string | undefined,
  data: Partial<User>
) => {
  try {
    const userUpdated = await prisma.user.update({
      where: { id },
      data,
    })

    return userUpdated
  } catch (error) {
    console.error(error)
    return null
  }
}

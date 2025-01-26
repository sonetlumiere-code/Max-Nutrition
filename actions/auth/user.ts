"use server"

import prisma from "@/lib/db/db"
import { User } from "@prisma/client"

export const updateUser = async (
  id: string,
  data: Partial<User> & { roleId?: string }
) => {
  try {
    const userUpdated = await prisma.user.update({
      where: { id },
      data,
    })

    return userUpdated
  } catch (error: any) {
    if (error.code) {
      console.error(`Prisma Error [${error.code}]:`, error.message)
    } else {
      console.error("Unexpected Error:", error)
    }

    return null
  }
}

"use server"

import prisma from "@/lib/db/db"

export const getPasswordResetToken = async (params: {
  where: {
    token?: string
    email?: string
  }
}) => {
  try {
    const passwordResetToken = await prisma.passwordResetToken.findFirst(params)

    return passwordResetToken
  } catch (error) {
    return null
  }
}

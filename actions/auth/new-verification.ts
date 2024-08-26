"use server"

import prisma from "@/lib/db/db"
import { updateUser } from "./user"

export const newVerification = async (token: string) => {
  const existingToken = await prisma.verificationToken.findFirst({
    where: { token },
  })

  if (!existingToken) {
    return { error: "El token no existe." }
  }

  const hasExpired = new Date(existingToken.expires) < new Date()

  if (hasExpired) {
    return { error: "Token caducado." }
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email: existingToken.email,
    },
  })

  if (!existingUser) {
    return { error: "El email no existe." }
  }

  await updateUser(existingUser.id, {
    emailVerified: new Date(),
    email: existingToken.email,
  })

  await prisma.verificationToken.delete({
    where: { id: existingToken.id },
  })

  return { success: "Email verificado." }
}

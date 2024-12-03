"use server"

import prisma from "@/lib/db/db"
import { sendWelcomeEmail } from "@/lib/mail/mail"
import { createCustomer } from "../customer/create-customer"
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

  try {
    await Promise.all([
      updateUser(existingUser.id, {
        emailVerified: new Date(),
        email: existingToken.email,
      }),
      createCustomer({
        userId: existingUser.id,
        name: existingUser.name || "",
      }),
      prisma.verificationToken.delete({
        where: { id: existingToken.id },
      }),
      sendWelcomeEmail(
        existingToken.email,
        existingUser.name || existingToken.email
      ),
    ])

    return { success: "Email verificado." }
  } catch (error) {
    console.error("Error during verification process:", error)
    return {
      error:
        "Error en el proceso de verificación. Por favor, inténtelo de nuevo.",
    }
  }
}

"use server"

import { getPasswordResetToken } from "@/data/password-reset-token"
import { getUser } from "@/data/user"
import {
  NewPasswordSchema,
  newPasswordSchema,
} from "@/lib/validations/new-password-validation"
import bcrypt from "bcryptjs"
import prisma from "@/lib/db/db"

export const newPassword = async (
  values: NewPasswordSchema,
  token?: string | null
) => {
  if (!token) {
    return { error: "El token no existe." }
  }

  const validatedFields = newPasswordSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campos inválidos." }
  }

  const { password } = validatedFields.data

  const existingToken = await getPasswordResetToken({ where: { token } })

  if (!existingToken) {
    return { error: "El token no existe." }
  }

  const hasExpired = new Date(existingToken.expires) < new Date()

  if (hasExpired) {
    return { error: "Token caducado." }
  }

  const existingUser = await getUser({ where: { email: existingToken.email } })

  if (!existingUser) {
    return { error: "El email no existe." }
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  await prisma.user.update({
    where: { id: existingUser.id },
    data: { password: hashedPassword },
  })

  await prisma.passwordResetToken.delete({
    where: { id: existingToken.id },
  })

  return { success: "Contraseña actualizada." }
}

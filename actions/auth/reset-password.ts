"use server"

import { getUser } from "@/data/user"
import { sendPasswordResetEmail } from "@/lib/mail/mail"
import { generatePasswordResetToken } from "@/lib/token/token"
import {
  ResetPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validations/reset-password"

export const resetPassword = async (values: ResetPasswordSchema) => {
  try {
    const validatedFields = resetPasswordSchema.safeParse(values)

    if (!validatedFields.success) {
      return { error: "Email inválido." }
    }

    const { email } = validatedFields.data

    const existingUser = await getUser({ where: { email } })

    if (!existingUser) {
      return { error: "Email no encontrado." }
    }

    const passwordResetToken = await generatePasswordResetToken(email)

    await sendPasswordResetEmail(
      passwordResetToken.email,
      passwordResetToken.token
    )

    return { success: "Email de cambio de contraseña enviado." }
  } catch (error) {
    console.error(error)
    return { error: "Algo salió mal." }
  }
}

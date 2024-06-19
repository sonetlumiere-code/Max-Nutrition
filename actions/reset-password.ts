"use server"

import { getUser } from "@/data/user"
import { sendPasswordResetEmail } from "@/lib/mail/mail"
import { generatePasswordResetToken } from "@/lib/token/token"
import { resetPasswordSchema } from "@/lib/validations/reset-password"
import { z } from "zod"

export const resetPassword = async (
  values: z.infer<typeof resetPasswordSchema>
) => {
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

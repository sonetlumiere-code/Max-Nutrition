"use server"

import { signIn } from "@/lib/auth/auth"
import prisma from "@/lib/db/db"
import { sendVerificationEmail } from "@/lib/mail/mail"
import { generateVerificationToken } from "@/lib/token/token"
import { LoginSchema, loginSchema } from "@/lib/validations/login-validation"
import { DEFAULT_REDIRECT_SHOP } from "@/routes"
import { AuthError } from "next-auth"

export const login = async ({
  values,
  redirectTo,
}: {
  values: LoginSchema
  redirectTo?: string
}) => {
  const validatedFields = loginSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campos inválidos." }
  }

  const { email, password } = validatedFields.data

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  })

  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { error: "El email no existe." }
  }

  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(
      existingUser.email
    )

    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    )

    return { success: "Email de confirmación enviado." }
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: redirectTo ? `/${redirectTo}` : DEFAULT_REDIRECT_SHOP,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Credenciales incorrectas." }
        default:
          return { error: "Algo salió mal." }
      }
    }

    throw error
  }
}

"use server"

import { signupSchema } from "@/lib/validations/signup-validation"
import { z } from "zod"
import bcrypt from "bcryptjs"
import prisma from "@/lib/db/db"
import { generateVerificationToken } from "@/lib/token/token"
import { sendVerificacionEmail } from "@/lib/mail/mail"

export const signUp = async (values: z.infer<typeof signupSchema>) => {
  const validatedFields = signupSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campos inválidos." }
  }

  const { email, password, name } = validatedFields.data

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  })

  if (existingUser) {
    return { error: "El email ya se encuentra registrado." }
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  })

  const verificationToken = await generateVerificationToken(email)

  await sendVerificacionEmail(verificationToken.email, verificationToken.token)

  return { success: "Email de confirmación enviado." }
}

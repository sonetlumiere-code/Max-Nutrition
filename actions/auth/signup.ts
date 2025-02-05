"use server"

import { SignupSchema, signupSchema } from "@/lib/validations/signup-validation"
import bcrypt from "bcryptjs"
import prisma from "@/lib/db/db"
import { generateVerificationToken } from "@/lib/token/token"
import { sendVerificationEmail } from "@/lib/mail/mail"

export const signUp = async (values: SignupSchema) => {
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

  const userRole = await prisma.role.findUnique({
    where: { name: "USER" },
  })

  if (!userRole) {
    return { error: "Rol de usuario no encontrado." }
  }

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: {
        connect: { id: userRole.id },
      },
    },
  })

  const verificationToken = await generateVerificationToken(email)

  await sendVerificationEmail(verificationToken.email, verificationToken.token)

  return { success: "Email de confirmación enviado." }
}

"use server"

import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/db/db"
import { customerSchema } from "@/lib/validations/customer-validation"
import { revalidatePath } from "next/cache"
import { z } from "zod"

type CustomerSchema = z.infer<typeof customerSchema>

export async function createCustomer(values: CustomerSchema) {
  const session = await auth()

  if (session?.user.role !== "ADMIN") {
    return { error: "No autorizado." }
  }

  const validatedFields = customerSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campos inválidos." }
  }

  const { birthdate, name, phone } = validatedFields.data

  try {
    const customer = await prisma.customer.create({
      data: {
        userId: null,
        birthdate,
        phone,
        name,
      },
      include: {
        orders: true,
      },
    })

    revalidatePath("/customers")

    return { success: customer }
  } catch (error) {
    console.error("Error creating customer:", error)
    return { error: "Hubo un error al crear el cliente." }
  }
}

"use server"

import { getCustomer } from "@/data/customer"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/db/db"
import { customerSchema } from "@/lib/validations/customer-validation"
import { revalidatePath } from "next/cache"
import { z } from "zod"

type CustomerSchema = z.infer<typeof customerSchema>

export async function createCustomer(values: CustomerSchema) {
  const session = await auth()

  if (!session?.user.id) {
    return { error: "Usuario no autenticado." }
  }

  const customer = await getCustomer({
    where: {
      userId: session?.user.id,
    },
  })

  if (customer) {
    return { error: "Usuario ya tiene un perfil de cliente." }
  }

  const validatedFields = customerSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campos inválidos." }
  }

  const { birthdate, name, phone } = validatedFields.data

  try {
    const customer = await prisma.customer.create({
      data: {
        userId: session?.user.id,
        birthdate,
        phone,
        name,
      },
      include: {
        orders: true,
      },
    })

    revalidatePath("/customer-info")

    return { success: customer }
  } catch (error) {
    console.error("Error creating customer:", error)
    return { error: "Hubo un error al crear el cliente." }
  }
}

"use server"

import { getCustomer } from "@/data/customer"
import prisma from "@/lib/db/db"
import { customerByUserSchema } from "@/lib/validations/customer-validation"
import { revalidatePath } from "next/cache"
import { z } from "zod"

type CustomerByUserSchema = z.infer<typeof customerByUserSchema>

export async function createCustomerByUser(values: CustomerByUserSchema) {
  const validatedFields = customerByUserSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campos inválidos." }
  }

  const { birthdate, name, phone, userId } = validatedFields.data

  const customer = await getCustomer({
    where: {
      userId,
    },
  })

  if (customer) {
    return { error: "Usuario ya tiene un perfil de cliente." }
  }

  try {
    const customer = await prisma.customer.create({
      data: {
        userId,
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

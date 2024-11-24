"use server"

import prisma from "@/lib/db/db"
import { customerSchema } from "@/lib/validations/customer-validation"
import { revalidatePath } from "next/cache"
import { z } from "zod"

type CustomerSchema = z.infer<typeof customerSchema>

export async function createCustomer(values: CustomerSchema) {
  const validatedFields = customerSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Invalid fields." }
  }

  const { userId, birthdate, name, phone } = validatedFields.data

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

"use server"

import prisma from "@/lib/db/db"
import { customerSchema } from "@/lib/validations/customer-validation"
import { z } from "zod"

type CustomerSchema = z.infer<typeof customerSchema>

export async function createCustomer(values: CustomerSchema) {
  const validatedFields = customerSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Invalid fields." }
  }

  const { userId, birthdate, address } = validatedFields.data

  try {
    const customer = await prisma.customer.create({
      data: {
        userId,
        birthdate,
        address: address
          ? {
              create: {
                address: address.address,
                city: address.city,
                postCode: address.postCode,
              },
            }
          : undefined,
      },
      include: {
        address: true,
      },
    })

    return { customer }
  } catch (error) {
    console.error("Error creating customer:", error)
    return { error: "Hubo un error al crear el cliente." }
  }
}

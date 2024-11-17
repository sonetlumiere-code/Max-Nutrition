"use server"

import prisma from "@/lib/db/db"
import { customerSchema } from "@/lib/validations/customer-validation"
import { revalidatePath } from "next/cache"
import { z } from "zod"

type CustomerSchema = z.infer<typeof customerSchema>

export async function editCustomer({
  id,
  values,
}: {
  id: string
  values: CustomerSchema
}) {
  const validatedFields = customerSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Invalid fields." }
  }

  const { name, birthdate, phone } = validatedFields.data

  try {
    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name,
        birthdate,
        phone,
      },
      include: {
        address: true,
        orders: true,
      },
    })

    revalidatePath("/customer-info")

    return { success: customer }
  } catch (error) {
    console.error("Error updating customer:", error)
    return { error: "Hubo un error al actualizar el cliente." }
  }
}

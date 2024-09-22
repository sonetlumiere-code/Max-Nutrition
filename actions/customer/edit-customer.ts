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

  const { name, birthdate, address, phone } = validatedFields.data

  try {
    // Filter out any undefined IDs from the address array
    const addressIds =
      address?.map((addr) => addr.id).filter((id): id is string => !!id) || []

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name,
        birthdate,
        phone,
        address: {
          deleteMany: {
            customerId: id,
            id: { notIn: addressIds }, // This now ensures only string IDs are used
          },
          upsert: address?.map((addr) => ({
            where: { id: addr.id || undefined },
            create: {
              address: addr.address,
              label: addr.label,
              labelString: addr.labelString,
              city: addr.city,
              postCode: addr.postCode,
            },
            update: {
              address: addr.address,
              label: addr.label,
              labelString: addr.labelString,
              city: addr.city,
              postCode: addr.postCode,
            },
          })),
        },
      },
      include: {
        address: true,
        orders: true,
      },
    })

    revalidatePath("customer-info")

    return { success: customer }
  } catch (error) {
    console.error("Error updating customer:", error)
    return { error: "Hubo un error al actualizar el cliente." }
  }
}

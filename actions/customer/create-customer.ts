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

  const { birthdate, name, phone, address } = validatedFields.data

  try {
    const customer = await prisma.customer.create({
      data: {
        userId: null,
        birthdate,
        phone,
        name,
      },
    })

    if (address && address.length > 0) {
      await prisma.customerAddress.createMany({
        data: address.map((addr) => ({
          customerId: customer.id,
          province: addr.province,
          municipality: addr.municipality,
          locality: addr.locality,
          addressStreet: addr.addressGeoRef.calle.nombre,
          addressNumber: addr.addressNumber,
          addressFloor: addr.addressFloor,
          addressApartment: addr.addressApartment,
          postCode: addr.postCode,
          label: addr.label,
          labelString: addr.labelString,
        })),
      })
    }

    revalidatePath("/customers")

    return { success: customer }
  } catch (error) {
    console.error("Error creating customer:", error)
    return { error: "Hubo un error al crear el cliente." }
  }
}

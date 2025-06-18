"use server"

import { hasPermission } from "@/helpers/helpers"
import { verifySession } from "@/lib/auth/verify-session"
import prisma from "@/lib/db/db"
import {
  CustomerSchema,
  customerSchema,
} from "@/lib/validations/customer-validation"
import { revalidatePath } from "next/cache"

export async function createCustomer(values: CustomerSchema) {
  const session = await verifySession()
  const user = session?.user

  if (!user) {
    return { error: "No autorizado." }
  }

  if (!hasPermission(session.user, "create:customers")) {
    return { error: "No autorizado." }
  }

  const validatedFields = customerSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campos inválidos." }
  }

  const { birthdate, name, phone, addresses } = validatedFields.data

  try {
    const customer = await prisma.customer.create({
      data: {
        userId: null,
        birthdate,
        phone,
        name,
        addresses: addresses?.length
          ? {
              create: addresses.map((addr) => ({
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
            }
          : undefined,
      },
    })

    revalidatePath("/customers")

    return { success: customer }
  } catch (error) {
    console.error("Error creating customer:", error)
    return { error: "Hubo un error al crear el cliente." }
  }
}

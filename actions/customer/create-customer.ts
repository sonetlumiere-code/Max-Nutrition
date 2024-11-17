"use server"

import prisma from "@/lib/db/db"
import { customerSchema } from "@/lib/validations/customer-validation"
import { AddressLabel } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { z } from "zod"

type CustomerSchema = z.infer<typeof customerSchema>

export async function createCustomer(values: CustomerSchema) {
  const validatedFields = customerSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Invalid fields." }
  }

  const { userId, birthdate, name, address, phone } = validatedFields.data

  try {
    const customer = await prisma.customer.create({
      data: {
        userId,
        birthdate,
        phone,
        name,
        address: address
          ? {
              create: address.map((addr) => ({
                label: addr.label,
                labelString:
                  addr.label === AddressLabel.Other ? addr.label : "",
                province: addr.province,
                municipality: addr.municipality,
                locality: addr.locality,
                addressStreet: addr.addressGeoRef.calle.nombre,
                addressNumber: addr.addressNumber,
                addressFloor: addr.addressFloor,
                addressApartament: addr.addressApartament,
                postCode: addr.postCode,
              })),
            }
          : undefined,
      },
      include: {
        address: true,
        orders: true,
      },
    })

    revalidatePath("customer-info")

    return { success: customer }
  } catch (error) {
    console.error("Error creating customer:", error)
    return { error: "Hubo un error al crear el cliente." }
  }
}

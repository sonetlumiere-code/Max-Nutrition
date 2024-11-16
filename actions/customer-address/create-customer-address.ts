"use server"

import prisma from "@/lib/db/db"
import { customerAddressSchema } from "@/lib/validations/customer-address-validation"
import { AddressLabel } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { z } from "zod"

type CustomerAddressSchema = z.infer<typeof customerAddressSchema>

export async function createCustomerAddress(
  customerId: string,
  values: CustomerAddressSchema
) {
  const validatedFields = customerAddressSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campos inválidos." }
  }

  const {
    province,
    municipality,
    locality,
    addressGeoRef,
    addressNumber,
    addressFloor,
    addressApartament,
    postCode,
    label,
    labelString,
  } = validatedFields.data

  try {
    const newAddress = await prisma.customerAddress.create({
      data: {
        customerId,
        province,
        municipality,
        locality,
        addressStreet: addressGeoRef.calle.nombre,
        addressNumber,
        addressFloor,
        addressApartament,
        postCode,
        label,
        labelString: label === AddressLabel.Other ? labelString : "",
      },
    })

    revalidatePath("/customer-info")

    return { success: newAddress }
  } catch (error) {
    console.error("Error creating customer address:", error)
    return { error: "Hubo un error al crear la dirección." }
  }
}

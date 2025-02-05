"use server"

import { getCustomer } from "@/data/customer"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/db/db"
import {
  CustomerAddressSchema,
  customerAddressSchema,
} from "@/lib/validations/customer-address-validation"
import { CustomerAddressLabel } from "@prisma/client"
import { revalidatePath } from "next/cache"

export async function createCustomerAddress(values: CustomerAddressSchema) {
  const session = await auth()

  const customer = await getCustomer({
    where: {
      userId: session?.user.id,
    },
  })

  if (!customer) {
    return { error: "Cliente no encontrado." }
  }

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
    addressApartment,
    postCode,
    label,
    labelString,
  } = validatedFields.data

  try {
    const newAddress = await prisma.customerAddress.create({
      data: {
        customerId: customer.id,
        province,
        municipality,
        locality,
        addressStreet: addressGeoRef.calle.nombre,
        addressNumber,
        addressFloor,
        addressApartment: addressApartment?.toUpperCase() || "",
        postCode,
        label,
        labelString: label === CustomerAddressLabel.OTHER ? labelString : "",
      },
    })

    revalidatePath("/customer-info")

    return { success: newAddress }
  } catch (error) {
    console.error("Error creating customer address:", error)
    return { error: "Hubo un error al crear la dirección." }
  }
}

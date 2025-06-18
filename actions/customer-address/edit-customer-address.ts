"use server"

import { getCustomer } from "@/data/customer"
import { verifySession } from "@/lib/auth/verify-session"
import prisma from "@/lib/db/db"
import {
  CustomerAddressSchema,
  customerAddressSchema,
} from "@/lib/validations/customer-address-validation"
import { CustomerAddressLabel } from "@prisma/client"
import { revalidatePath } from "next/cache"

export async function editCustomerAddress(
  id: string,
  values: CustomerAddressSchema
) {
  const session = await verifySession()

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
    notes,
  } = validatedFields.data

  try {
    const updatedAddress = await prisma.customerAddress.update({
      where: {
        id,
        customerId: customer.id,
      },
      data: {
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
        notes,
      },
    })

    revalidatePath("/customer-info")

    return { success: updatedAddress }
  } catch (error) {
    console.error("Error updating customer address:", error)
    return { error: "Hubo un error al editar la dirección." }
  }
}

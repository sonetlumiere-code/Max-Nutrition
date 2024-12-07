"use server"

import { getCustomer } from "@/data/customer"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/db/db"
import { customerAddressSchema } from "@/lib/validations/customer-address-validation"
import { CustomerAddressLabel } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { z } from "zod"

type CustomerAddressSchema = z.infer<typeof customerAddressSchema>

export async function editCustomerAddress(
  id: string,
  values: CustomerAddressSchema
) {
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
        labelString: label === CustomerAddressLabel.Other ? labelString : "",
      },
    })

    revalidatePath("/customer-info")

    return { success: updatedAddress }
  } catch (error) {
    console.error("Error updating customer address:", error)
    return { error: "Hubo un error al editar la dirección." }
  }
}

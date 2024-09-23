"use server"

import prisma from "@/lib/db/db"
import { customerAddressSchema } from "@/lib/validations/customer-address-validation"
import { AddressLabel } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { z } from "zod"

type CustomerAddressSchema = z.infer<typeof customerAddressSchema>

export async function editCustomerAddress(
  id: string,
  values: CustomerAddressSchema
) {
  const validatedFields = customerAddressSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campos inválidos." }
  }

  const { address, city, postCode, label, labelString } = validatedFields.data

  try {
    const updatedAddress = await prisma.customerAddress.update({
      where: {
        id,
      },
      data: {
        address,
        city,
        postCode,
        label,
        labelString: label === AddressLabel.Other ? labelString : "",
      },
    })

    revalidatePath("/customer-info")

    return { success: updatedAddress }
  } catch (error) {
    console.error("Error updating customer address:", error)
    return { error: "Hubo un error al editar la dirección." }
  }
}

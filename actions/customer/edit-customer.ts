"use server"

import { hasPermission } from "@/helpers/helpers"
import { auth } from "@/lib/auth/auth"
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
  const session = await auth()
  const user = session?.user

  if (!user) {
    return { error: "No autorizado." }
  }

  if (!hasPermission(session.user, "update:customers")) {
    return { error: "No autorizado." }
  }

  const validatedFields = customerSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campos inválidos." }
  }

  const { name, birthdate, phone, address } = validatedFields.data

  try {
    const existingAddresses = await prisma.customerAddress.findMany({
      where: { customerId: id },
    })

    const incomingAddressIds =
      address?.map((addr) => addr.id).filter(Boolean) || []
    const addressesToDelete = existingAddresses
      .filter((existing) => !incomingAddressIds.includes(existing.id))
      .map((addr) => addr.id)

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name,
        birthdate,
        phone,
        address: {
          upsert: address?.map((addr) => ({
            where: { id: addr.id || "" },
            create: {
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
            },
            update: {
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
            },
          })),
        },
      },
      include: {
        address: true,
        orders: true,
      },
    })

    if (addressesToDelete.length > 0) {
      await prisma.customerAddress.deleteMany({
        where: { id: { in: addressesToDelete } },
      })
    }

    revalidatePath("/customers")

    return { success: customer }
  } catch (error) {
    console.error("Error updating customer:", error)
    return { error: "Hubo un error al actualizar el cliente." }
  }
}

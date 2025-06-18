"use server"

import { hasPermission } from "@/helpers/helpers"
import { verifySession } from "@/lib/auth/verify-session"
import prisma from "@/lib/db/db"
import {
  CustomerSchema,
  customerSchema,
} from "@/lib/validations/customer-validation"
import { revalidatePath } from "next/cache"

export async function editCustomer({
  id,
  values,
}: {
  id: string
  values: CustomerSchema
}) {
  const session = await verifySession()
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

  const { name, birthdate, phone, addresses } = validatedFields.data

  try {
    const existingAddresses = await prisma.customerAddress.findMany({
      where: { customerId: id },
    })

    const incomingAddressIds =
      addresses?.map((addr) => addr.id).filter(Boolean) || []
    const addressesToDelete = existingAddresses
      .filter((existing) => !incomingAddressIds.includes(existing.id))
      .map((addr) => addr.id)

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name,
        birthdate,
        phone,
        addresses: {
          upsert: addresses?.map((addr) => ({
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
        addresses: true,
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

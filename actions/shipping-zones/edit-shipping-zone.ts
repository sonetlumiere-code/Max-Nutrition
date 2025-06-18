"use server"

import { hasPermission } from "@/helpers/helpers"
import { verifySession } from "@/lib/auth/verify-session"
import prisma from "@/lib/db/db"
import {
  ShippingZoneSchema,
  shippingZoneSchema,
} from "@/lib/validations/shipping-zone-validation"
import { revalidatePath } from "next/cache"

export async function editShippingZone({
  id,
  values,
}: {
  id: string
  values: ShippingZoneSchema
}) {
  const session = await verifySession()
  const user = session?.user

  if (!user) {
    return { error: "No autorizado." }
  }

  if (!hasPermission(session.user, "update:shippingZones")) {
    return { error: "No autorizado." }
  }

  const validatedFields = shippingZoneSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campos inválidos." }
  }

  const { province, municipality, locality, cost, isActive, operationalHours } =
    validatedFields.data

  try {
    const updatedShippingZone = await prisma.shippingZone.update({
      where: { id },
      data: {
        province,
        municipality,
        locality,
        cost,
        isActive,
        operationalHours:
          operationalHours && operationalHours.length > 0
            ? {
                deleteMany: {},
                create: operationalHours.map(
                  ({ dayOfWeek, startTime, endTime }) => ({
                    dayOfWeek,
                    startTime: startTime || null,
                    endTime: endTime || null,
                  })
                ),
              }
            : {
                deleteMany: {},
                create: [],
              },
      },
    })

    revalidatePath("/shippings")

    return { success: updatedShippingZone }
  } catch (error) {
    console.error("Error updating shipping zone:", error)
    return { error: "Hubo un error al actualizar la zona de envío." }
  }
}

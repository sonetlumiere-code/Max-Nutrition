"use server"

import { hasPermission } from "@/helpers/helpers"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/db/db"
import {
  ShippingZoneSchema,
  shippingZoneSchema,
} from "@/lib/validations/shipping-zone-validation"
import { revalidatePath } from "next/cache"

const shopSettingsId = process.env.SHOP_SETTINGS_ID

export async function createShippingZone(values: ShippingZoneSchema) {
  if (!shopSettingsId) {
    return { error: "Es necesario el ID de la configuración de tienda." }
  }

  const session = await auth()
  const user = session?.user

  if (!user) {
    return { error: "No autorizado." }
  }

  if (!hasPermission(session.user, "create:shippingZones")) {
    return { error: "No autorizado." }
  }
  const validatedFields = shippingZoneSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campos inválidos." }
  }

  const { province, municipality, locality, cost, isActive, operationalHours } =
    validatedFields.data

  try {
    const shippingZone = await prisma.shippingZone.create({
      data: {
        shopSettingsId,
        province,
        municipality,
        locality,
        cost,
        isActive,
        operationalHours: {
          create: operationalHours?.map((hours) => ({
            dayOfWeek: hours.dayOfWeek,
            startTime: hours.startTime || null,
            endTime: hours.endTime || null,
          })),
        },
      },
    })

    revalidatePath("/shippings")

    return { success: shippingZone }
  } catch (error) {
    console.error("Error creating shipping zone:", error)
    return { error: "Hubo un error al crear la zona de envío." }
  }
}

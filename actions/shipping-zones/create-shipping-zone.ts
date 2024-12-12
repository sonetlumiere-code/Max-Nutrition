"use server"

import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/db/db"
import { shippingZoneSchema } from "@/lib/validations/shipping-zone-validation"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const shippingSettingsId = process.env.SHIPPING_SETTINGS_ID as string

type ShippingZoneSchema = z.infer<typeof shippingZoneSchema>

export async function createShippingZone(values: ShippingZoneSchema) {
  const session = await auth()

  if (session?.user.role !== "ADMIN") {
    return { error: "No autorizado." }
  }

  const validatedFields = shippingZoneSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campos inválidos." }
  }

  const { province, municipality, locality, cost, isActive } =
    validatedFields.data

  try {
    const shippingZone = await prisma.shippingZone.create({
      data: {
        shippingSettingsId,
        province,
        municipality,
        locality,
        cost,
        isActive,
      },
    })

    revalidatePath("/shippings")

    return { success: shippingZone }
  } catch (error) {
    console.error("Error creating shipping zone:", error)
    return { error: "Hubo un error al crear la zona de envío." }
  }
}

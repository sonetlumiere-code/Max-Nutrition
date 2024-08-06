"use server"

import prisma from "@/lib/db/db"
import { shippingZoneSchema } from "@/lib/validations/shipping-zone-validation"
import { revalidatePath } from "next/cache"
import { z } from "zod"

type ShippingZoneSchema = z.infer<typeof shippingZoneSchema>

export async function createShippingZone(values: ShippingZoneSchema) {
  const validatedFields = shippingZoneSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campos inválidos." }
  }

  const { neighborhood, cost } = validatedFields.data

  try {
    const shippingZone = await prisma.shippingZone.create({
      data: {
        neighborhood,
        cost,
      },
    })

    revalidatePath("/shipping-zones")

    return { success: shippingZone }
  } catch (error) {
    console.error("Error creating shipping zone:", error)
    return { error: "Hubo un error al crear la zona de envío." }
  }
}

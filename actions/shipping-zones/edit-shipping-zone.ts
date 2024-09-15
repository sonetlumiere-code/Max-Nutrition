"use server"

import prisma from "@/lib/db/db"
import { shippingZoneSchema } from "@/lib/validations/shipping-zone-validation"
import { revalidatePath } from "next/cache"
import { z } from "zod"

type ShippingZoneSchema = z.infer<typeof shippingZoneSchema>

export async function editShippingZone({
  id,
  values,
}: {
  id: string
  values: ShippingZoneSchema
}) {
  const validatedFields = shippingZoneSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campos inválidos." }
  }

  const { cost, zone } = validatedFields.data

  try {
    const updatedShippingZone = await prisma.shippingZone.update({
      where: { id },
      data: {
        cost,
        zone,
      },
    })

    revalidatePath("/shippings")

    return { success: updatedShippingZone }
  } catch (error) {
    console.error("Error updating shipping zone:", error)
    return { error: "Hubo un error al actualizar la zona de envío." }
  }
}

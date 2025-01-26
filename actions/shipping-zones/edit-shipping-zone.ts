"use server"

import { hasPermission } from "@/helpers/helpers"
import { auth } from "@/lib/auth/auth"
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
  const session = await auth()
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

  const { province, municipality, locality, cost, isActive } =
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
      },
    })

    revalidatePath("/shippings")

    return { success: updatedShippingZone }
  } catch (error) {
    console.error("Error updating shipping zone:", error)
    return { error: "Hubo un error al actualizar la zona de envío." }
  }
}

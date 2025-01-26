"use server"

import { hasPermission } from "@/helpers/helpers"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/db/db"
import { shippingSettingsSchema } from "@/lib/validations/shipping-settings-validation"
import { revalidatePath } from "next/cache"
import { z } from "zod"

type ShippingSettingsSchema = z.infer<typeof shippingSettingsSchema>

export async function editShippingSettings({
  id,
  values,
}: {
  id: string
  values: ShippingSettingsSchema
}) {
  const session = await auth()
  const user = session?.user

  if (!user) {
    return { error: "No autorizado." }
  }

  if (!hasPermission(session.user, "update:shippingSettings")) {
    return { error: "No autorizado." }
  }

  const validatedFields = shippingSettingsSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campos inválidos." }
  }

  const { allowedShippingMethods, minProductsQuantityForDelivery } =
    validatedFields.data

  try {
    const updatedShippingSettings = await prisma.shippingSettings.update({
      where: { id },
      data: {
        allowedShippingMethods,
        minProductsQuantityForDelivery,
      },
    })

    revalidatePath("/shippings")

    return { success: updatedShippingSettings }
  } catch (error) {
    console.error("Error updating shipping settings:", error)
    return { error: "Hubo un error al actualizar la configuración de envíos." }
  }
}

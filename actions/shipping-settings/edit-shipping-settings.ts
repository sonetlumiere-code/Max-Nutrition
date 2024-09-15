"use server"

import prisma from "@/lib/db/db"
import { shippingSettingsSchema } from "@/lib/validations/shipping-settings-validation"
import { revalidatePath } from "next/cache"
import { z } from "zod"

type ShippingSettingsSchema = z.infer<typeof shippingSettingsSchema>

export async function editShippingSettings({
  values,
}: {
  values: ShippingSettingsSchema
}) {
  const validatedFields = shippingSettingsSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campos inválidos." }
  }

  const { shipping, takeAway, minProductsQuantityForShipping } =
    validatedFields.data

  try {
    const updatedShippingSettings = await prisma.shippingSettings.update({
      where: { id: "1" },
      data: {
        shipping,
        takeAway,
        minProductsQuantityForShipping,
      },
    })

    revalidatePath("/shippings")

    return { success: updatedShippingSettings }
  } catch (error) {
    console.error("Error updating shipping zone:", error)
    return { error: "Hubo un error al actualizar la configuración de envíos." }
  }
}

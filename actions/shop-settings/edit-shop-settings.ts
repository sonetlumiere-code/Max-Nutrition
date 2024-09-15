"use server"

import prisma from "@/lib/db/db"
import { shopSettingsSchema } from "@/lib/validations/shop-settings-validation"
import { revalidatePath } from "next/cache"
import { z } from "zod"

type ShopSettingsSchema = z.infer<typeof shopSettingsSchema>

export async function editShopSettings({
  values,
}: {
  values: ShopSettingsSchema
}) {
  const validatedFields = shopSettingsSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campos inválidos." }
  }

  const {
    operationalHours,
    minProductsQuantityForShipping,
    shipping,
    takeAway,
  } = validatedFields.data

  try {
    const updatedShopSettings = await prisma.shopSettings.update({
      where: { id: "1" },
      data: {
        operationalHours,
        minProductsQuantityForShipping,
        shipping,
        takeAway,
      },
    })

    revalidatePath("/shop-settings")

    return { success: updatedShopSettings }
  } catch (error) {
    console.error("Error updating shop settings:", error)
    return {
      error: "Hubo un error al actualizar la configuración de la tienda.",
    }
  }
}

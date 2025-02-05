"use server"

import { hasPermission } from "@/helpers/helpers"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/db/db"
import {
  ShopSettingsSchema,
  shopSettingsSchema,
} from "@/lib/validations/shop-settings-validation"
import { revalidatePath } from "next/cache"

export async function editSettings({
  id,
  values,
}: {
  id: string
  values: ShopSettingsSchema
}) {
  const session = await auth()
  const user = session?.user

  if (!user) {
    return { error: "No autorizado." }
  }

  if (!hasPermission(session.user, "update:shopSettings")) {
    return { error: "No autorizado." }
  }

  const validatedFields = shopSettingsSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campos inválidos." }
  }

  const { allowedPaymentMethods } = validatedFields.data

  try {
    const updatedSettings = await prisma.shopSettings.update({
      where: { id },
      data: {
        allowedPaymentMethods,
      },
    })

    revalidatePath("/shop-settings")

    return { success: updatedSettings }
  } catch (error) {
    console.error("Error updating shop settings:", error)
    return {
      error: "Hubo un error al actualizar la configuración.",
    }
  }
}

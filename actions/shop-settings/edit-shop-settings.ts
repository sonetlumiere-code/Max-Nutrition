"use server"

import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/db/db"
import { shopSettingsSchema } from "@/lib/validations/shop-settings-validation"
import { revalidatePath } from "next/cache"
import { z } from "zod"

type SettingsSchema = z.infer<typeof shopSettingsSchema>

export async function editSettings({ values }: { values: SettingsSchema }) {
  const session = await auth()

  if (session?.user.role !== "ADMIN") {
    return { error: "No autorizado." }
  }

  const validatedFields = shopSettingsSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campos inválidos." }
  }

  const { allowedPaymentMethods } = validatedFields.data

  try {
    const updatedSettings = await prisma.shopSettings.update({
      where: { id: "1" },
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

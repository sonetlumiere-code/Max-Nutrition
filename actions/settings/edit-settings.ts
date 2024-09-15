"use server"

import prisma from "@/lib/db/db"
import { settingsSchema } from "@/lib/validations/settings-validation"
import { revalidatePath } from "next/cache"
import { z } from "zod"

type SettingsSchema = z.infer<typeof settingsSchema>

export async function editSettings({ values }: { values: SettingsSchema }) {
  const validatedFields = settingsSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campos inválidos." }
  }

  const { operationalHours } = validatedFields.data

  try {
    const updatedSettings = await prisma.settings.update({
      where: { id: "1" },
      data: {
        operationalHours,
      },
    })

    revalidatePath("/settings")

    return { success: updatedSettings }
  } catch (error) {
    console.error("Error updating settings:", error)
    return {
      error: "Hubo un error al actualizar la configuración.",
    }
  }
}

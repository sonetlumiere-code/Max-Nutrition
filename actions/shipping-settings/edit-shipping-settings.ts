"use server"

import { auth } from "@/lib/auth/auth"
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
  const session = await auth()

  if (session?.user.role !== "ADMIN") {
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
      where: { id: "1" },
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

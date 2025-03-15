"use server"

import { hasPermission } from "@/helpers/helpers"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/db/db"
import { shopSchema, ShopSchema } from "@/lib/validations/shop-validation"
import { revalidatePath } from "next/cache"

export async function editShop({
  id,
  values,
}: {
  id: string
  values: ShopSchema
}) {
  const session = await auth()
  const user = session?.user

  if (!user) {
    return { error: "No autorizado." }
  }

  if (!hasPermission(session.user, "update:shops")) {
    return { error: "No autorizado." }
  }

  const validatedFields = shopSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campos inválidos." }
  }

  const {
    name,
    title,
    description,
    key,
    message,
    bannerImage,
    shopCategory,
    operationalHours,
    isActive,
  } = validatedFields.data

  try {
    const updatedShop = await prisma.shop.update({
      where: { id },
      data: {
        name,
        title,
        description,
        message,
        bannerImage,
        key,
        shopCategory,
        isActive,
        operationalHours:
          operationalHours && operationalHours.length > 0
            ? {
                deleteMany: {},
                create: operationalHours.map(
                  ({ dayOfWeek, startTime, endTime }) => ({
                    dayOfWeek,
                    startTime: startTime || null,
                    endTime: endTime || null,
                  })
                ),
              }
            : {
                deleteMany: {},
                create: [],
              },
      },
    })

    revalidatePath("/shops")

    return { success: updatedShop }
  } catch (error) {
    console.error("Error updating shop:", error)
    return { error: "Hubo un error al actualizar la tienda." }
  }
}

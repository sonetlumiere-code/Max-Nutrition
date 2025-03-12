"use server"

import { hasPermission } from "@/helpers/helpers"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/db/db"
import { shopSchema, ShopSchema } from "@/lib/validations/shop-validation"
import { revalidatePath } from "next/cache"

export async function createShop(values: ShopSchema) {
  const session = await auth()
  const user = session?.user

  if (!user) {
    return { error: "No autorizado." }
  }

  if (!hasPermission(session.user, "create:shops")) {
    return { error: "No autorizado." }
  }

  const validatedFields = shopSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campos inválidos." }
  }

  const { name, key, title, description, shopCategory } = validatedFields.data

  try {
    const shop = await prisma.shop.create({
      data: {
        name,
        key,
        title,
        description,
        shopCategory,
      },
    })

    revalidatePath("/shops")

    return { success: shop }
  } catch (error) {
    console.error("Error creating shop:", error)
    return { error: "Hubo un error al crear la tienda." }
  }
}

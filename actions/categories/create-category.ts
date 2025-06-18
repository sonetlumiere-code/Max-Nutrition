"use server"

import { hasPermission } from "@/helpers/helpers"
import { verifySession } from "@/lib/auth/verify-session"
import prisma from "@/lib/db/db"
import {
  CategorySchema,
  categorySchema,
} from "@/lib/validations/category-validation"
import { revalidatePath } from "next/cache"

export async function createCategory(values: CategorySchema) {
  const session = await verifySession()
  const user = session?.user

  if (!user) {
    return { error: "No autorizado." }
  }

  if (!hasPermission(session.user, "create:categories")) {
    return { error: "No autorizado." }
  }

  const validatedFields = categorySchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campos inválidos." }
  }

  const { name, productsIds, promotionsIds, shopCategory } =
    validatedFields.data

  try {
    const newCategory = await prisma.category.create({
      data: {
        name,
        shopCategory,
        products: {
          connect: productsIds?.map((productId) => ({ id: productId })) || [],
        },
        promotions: {
          connect:
            promotionsIds?.map((promotionId) => ({ id: promotionId })) || [],
        },
      },
    })

    revalidatePath("/categories")

    return { success: newCategory }
  } catch (error) {
    console.error("Error creating category:", error)
    return { error: "Hubo un error al crear la categoría." }
  }
}

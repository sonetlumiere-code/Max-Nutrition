"use server"

import { hasPermission } from "@/helpers/helpers"
import { verifySession } from "@/lib/auth/verify-session"
import prisma from "@/lib/db/db"
import {
  ProductRecipeSchema,
  productRecipeTypeSchema,
} from "@/lib/validations/product-recipe-type-validation"
import { revalidatePath } from "next/cache"

export async function createProductRecipeType(values: ProductRecipeSchema) {
  const session = await verifySession()
  const user = session?.user

  if (!user) {
    return { error: "No autorizado." }
  }

  if (!hasPermission(session.user, "create:productRecipeTypes")) {
    return { error: "No autorizado." }
  }

  const validatedFields = productRecipeTypeSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campos inválidos." }
  }

  const { name } = validatedFields.data

  try {
    const productRecipeType = await prisma.productRecipeType.create({
      data: {
        name,
      },
    })

    revalidatePath("/recipes")

    return { success: productRecipeType }
  } catch (error) {
    console.error("Error creating product recipe type:", error)
    return { error: "Hubo un error al crear el tipo de receta." }
  }
}

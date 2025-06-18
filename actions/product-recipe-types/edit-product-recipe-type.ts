"use server"

import { hasPermission } from "@/helpers/helpers"
import { verifySession } from "@/lib/auth/verify-session"
import prisma from "@/lib/db/db"
import {
  ProductRecipeSchema,
  productRecipeTypeSchema,
} from "@/lib/validations/product-recipe-type-validation"
import { revalidatePath } from "next/cache"

export async function editProductRecipeType({
  id,
  values,
}: {
  id: string
  values: ProductRecipeSchema
}) {
  const session = await verifySession()
  const user = session?.user

  if (!user) {
    return { error: "No autorizado." }
  }

  if (!hasPermission(session.user, "update:productRecipeTypes")) {
    return { error: "No autorizado." }
  }

  const validatedFields = productRecipeTypeSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campos inválidos." }
  }

  const { name } = validatedFields.data

  try {
    const updatedProductRecipeType = await prisma.productRecipeType.update({
      where: { id },
      data: { name },
    })

    revalidatePath("/recipes")

    return { success: updatedProductRecipeType }
  } catch (error) {
    console.error("Error updating product recipe type:", error)
    return { error: "Hubo un error al actualizar el tipo de receta." }
  }
}

"use server"

import { hasPermission } from "@/helpers/helpers"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/db/db"
import { RecipeSchema, recipeSchema } from "@/lib/validations/recipe-validation"
import { revalidatePath } from "next/cache"

export async function editRecipe({
  id,
  values,
}: {
  id: string
  values: RecipeSchema
}) {
  const session = await auth()
  const user = session?.user

  if (!user) {
    return { error: "No autorizado." }
  }

  if (!hasPermission(session.user, "update:recipes")) {
    return { error: "No autorizado." }
  }

  const validatedFields = recipeSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campos inválidos." }
  }

  const { name, description, ingredients } = validatedFields.data

  try {
    const updatedRecipe = await prisma.recipe.update({
      where: { id },
      data: {
        name,
        description,
        recipeIngredients: {
          deleteMany: {},
          create: ingredients.map(({ ingredientId, quantity }) => ({
            ingredient: { connect: { id: ingredientId } },
            quantity,
          })),
        },
      },
      include: {
        recipeIngredients: true,
      },
    })

    revalidatePath("/recipes")

    return { success: updatedRecipe }
  } catch (error) {
    console.error("Error updating recipe:", error)
    return { error: "Hubo un error al actualizar la receta." }
  }
}

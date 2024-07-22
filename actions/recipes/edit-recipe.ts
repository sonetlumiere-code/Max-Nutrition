"use server"

import prisma from "@/lib/db/db"
import { recipeSchema } from "@/lib/validations/recipe-validation"
import { revalidatePath } from "next/cache"
import { z } from "zod"

type RecipeSchema = z.infer<typeof recipeSchema>

export async function editRecipe({
  id,
  values,
}: {
  id: string
  values: RecipeSchema
}) {
  const validatedFields = recipeSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campos inválidos." }
  }

  const { name, description, ingredients } = validatedFields.data

  try {
    // Update the recipe with nested writes for ingredients
    const updatedRecipe = await prisma.recipe.update({
      where: { id },
      data: {
        name,
        description,
        ingredients: {
          deleteMany: {}, // Deletes all current recipe ingredients
          create: ingredients.map((ingredient) => ({
            ingredientId: ingredient.ingredientId,
            quantity: ingredient.quantity,
          })),
        },
      },
      include: {
        ingredients: true,
      },
    })

    revalidatePath("/recipes")

    return { success: updatedRecipe }
  } catch (error) {
    console.error("Error updating recipe:", error)
    return { error: "Hubo un error al actualizar la receta." }
  }
}

"use server"

import prisma from "@/lib/db/db"
import { recipeSchema } from "@/lib/validations/recipes-validation"
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
    // Fetch the existing recipe with its ingredients
    const existingRecipe = await prisma.recipe.findUnique({
      where: { id },
      include: { ingredients: true },
    })

    if (!existingRecipe) {
      return { error: "Receta no encontrada." }
    }

    // Upsert new or existing ingredients
    await Promise.all(
      ingredients.map((ingredient) =>
        prisma.recipeIngredient.upsert({
          where: {
            recipeId_ingredientId: {
              recipeId: id,
              ingredientId: ingredient.ingredientId,
            },
          },
          update: {
            quantity: ingredient.quantity,
          },
          create: {
            recipeId: id,
            ingredientId: ingredient.ingredientId,
            quantity: ingredient.quantity,
          },
        })
      )
    )

    // Remove ingredients no longer associated with the recipe
    const existingIngredientIds = existingRecipe.ingredients.map(
      (ingredient) => ingredient.ingredientId
    )
    const newIngredientIds = ingredients.map(
      (ingredient) => ingredient.ingredientId
    )

    const ingredientsToRemove = existingIngredientIds.filter(
      (id) => !newIngredientIds.includes(id)
    )

    await Promise.all(
      ingredientsToRemove.map((ingredientId) =>
        prisma.recipeIngredient.delete({
          where: {
            recipeId_ingredientId: {
              recipeId: id,
              ingredientId,
            },
          },
        })
      )
    )

    // Update the recipe details
    const updatedRecipe = await prisma.recipe.update({
      where: { id },
      data: {
        name,
        description,
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

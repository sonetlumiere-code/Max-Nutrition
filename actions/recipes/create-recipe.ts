"use server"

import { hasPermission } from "@/helpers/helpers"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/db/db"
import { RecipeSchema, recipeSchema } from "@/lib/validations/recipe-validation"
import { revalidatePath } from "next/cache"

export async function createRecipe(values: RecipeSchema) {
  const session = await auth()
  const user = session?.user

  if (!user) {
    return { error: "No autorizado." }
  }

  if (!hasPermission(session.user, "create:recipes")) {
    return { error: "No autorizado." }
  }

  const validatedFields = recipeSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campos inválidos." }
  }

  const { name, description, ingredients } = validatedFields.data

  try {
    const recipe = await prisma.recipe.create({
      data: {
        name,
        description,
        recipeIngredients: {
          create: ingredients.map((ingredient) => ({
            ingredientId: ingredient.ingredientId,
            quantity: ingredient.quantity,
          })),
        },
      },
      include: {
        recipeIngredients: true,
      },
    })

    revalidatePath("/recipes")

    return { success: recipe }
  } catch (error) {
    console.error("Error creating recipe:", error)
    return { error: "Hubo un error al crear la receta." }
  }
}

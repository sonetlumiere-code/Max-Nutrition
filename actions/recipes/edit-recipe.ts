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

  const { name, description } = validatedFields.data

  try {
    const recipe = await prisma.recipe.update({
      where: { id },
      data: { name, description },
    })

    revalidatePath("/recipes")

    return { success: recipe }
  } catch (error) {
    return { error: "Hubo un error al actualizar la receta." }
  }
}

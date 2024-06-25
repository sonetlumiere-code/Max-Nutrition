"use server"

import prisma from "@/lib/db/db"
import { ingredientSchema } from "@/lib/validations/ingredients-validation"
import { z } from "zod"

type IngredientSchema = z.infer<typeof ingredientSchema>

export async function createIngredient(values: IngredientSchema) {
  const validatedFields = ingredientSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campos inválidos." }
  }

  const { name, price, waste } = validatedFields.data

  try {
    const ingredient = await prisma.ingredient.create({
      data: {
        name,
        price,
        waste,
      },
    })

    return { success: ingredient }
  } catch (error) {
    return { error: "Hubo un problema al crear el ingrediente." }
  }
}

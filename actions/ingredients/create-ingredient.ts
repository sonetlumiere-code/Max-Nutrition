"use server"

import prisma from "@/lib/db/db"
import { ingredientSchema } from "@/lib/validations/ingredients-validation"
import { revalidatePath } from "next/cache"
import { z } from "zod"

type IngredientSchema = z.infer<typeof ingredientSchema>

export async function createIngredient(values: IngredientSchema) {
  const validatedFields = ingredientSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campos inválidos." }
  }

  const { name, price, waste, unit } = validatedFields.data

  try {
    const ingredient = await prisma.ingredient.create({
      data: {
        name,
        price,
        waste,
        unit,
      },
    })

    revalidatePath("/ingredients")

    return { success: ingredient }
  } catch (error) {
    return { error: "Hubo un error al crear el ingrediente." }
  }
}

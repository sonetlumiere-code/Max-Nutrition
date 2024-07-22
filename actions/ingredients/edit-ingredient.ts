"use server"

import prisma from "@/lib/db/db"
import { ingredientSchema } from "@/lib/validations/ingredient-validation"
import { revalidatePath } from "next/cache"
import { z } from "zod"

type IngredientSchema = z.infer<typeof ingredientSchema>

export async function editIngredient({
  id,
  values,
}: {
  id: string
  values: IngredientSchema
}) {
  const validatedFields = ingredientSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campos inválidos." }
  }

  const { name, price, waste, unit } = validatedFields.data

  try {
    const ingredient = await prisma.ingredient.update({
      where: { id },
      data: { name, price, waste, unit },
    })

    revalidatePath("/ingredients")

    return { success: ingredient }
  } catch (error) {
    return { error: "Hubo un error al actualizar el ingrediente." }
  }
}

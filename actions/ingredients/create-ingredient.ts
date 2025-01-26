"use server"

import { hasPermission } from "@/helpers/helpers"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/db/db"
import { ingredientSchema } from "@/lib/validations/ingredient-validation"
import { revalidatePath } from "next/cache"
import { z } from "zod"

type IngredientSchema = z.infer<typeof ingredientSchema>

export async function createIngredient(values: IngredientSchema) {
  const session = await auth()
  const user = session?.user

  if (!user) {
    return { error: "No autorizado." }
  }

  if (!hasPermission(session.user, "create:ingredients")) {
    return { error: "No autorizado." }
  }

  const validatedFields = ingredientSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campos inválidos." }
  }

  const { name, price, waste, measurement, amountPerMeasurement } =
    validatedFields.data

  try {
    const ingredient = await prisma.ingredient.create({
      data: {
        name,
        price,
        waste,
        measurement,
        amountPerMeasurement,
      },
    })

    revalidatePath("/ingredients")

    return { success: ingredient }
  } catch (error) {
    return { error: "Hubo un error al crear el ingrediente." }
  }
}

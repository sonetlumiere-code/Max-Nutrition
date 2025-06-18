"use server"

import { hasPermission } from "@/helpers/helpers"
import { verifySession } from "@/lib/auth/verify-session"
import prisma from "@/lib/db/db"
import {
  IngredientSchema,
  ingredientSchema,
} from "@/lib/validations/ingredient-validation"
import { revalidatePath } from "next/cache"

export async function editIngredient({
  id,
  values,
}: {
  id: string
  values: IngredientSchema
}) {
  const session = await verifySession()
  const user = session?.user

  if (!user) {
    return { error: "No autorizado." }
  }

  if (!hasPermission(session.user, "update:ingredients")) {
    return { error: "No autorizado." }
  }

  const validatedFields = ingredientSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campos inválidos." }
  }

  const { name, price, waste, measurement, amountPerMeasurement } =
    validatedFields.data

  try {
    const ingredient = await prisma.ingredient.update({
      where: { id },
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
    return { error: "Hubo un error al actualizar el ingrediente." }
  }
}

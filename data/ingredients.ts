"use server"

import prisma from "@/lib/db/db"
import { Ingredient } from "@prisma/client"

export const getIngredients = async (): Promise<Ingredient[] | null> => {
  try {
    const ingredients = await prisma.ingredient.findMany()

    return ingredients
  } catch (error) {
    console.error(error)
    return null
  }
}

export const getIngredient = async (params: {
  where: {
    id?: string
    name?: string
  }
}): Promise<Ingredient | null> => {
  try {
    const ingredient = await prisma.ingredient.findFirst(params)

    return ingredient
  } catch (error) {
    console.error(error)
    return null
  }
}

"server-only"

import prisma from "@/lib/db/db"
import { PopulatedIngredient } from "@/types/types"
import { Prisma } from "@prisma/client"

export const getIngredients = async (args?: Prisma.IngredientFindManyArgs) => {
  try {
    const ingredients = await prisma.ingredient.findMany(args)

    return ingredients as PopulatedIngredient[]
  } catch (error) {
    console.error("Error fetching ingredients:", error)
    return null
  }
}

export const getIngredient = async (args: Prisma.IngredientFindFirstArgs) => {
  try {
    const ingredient = await prisma.ingredient.findFirst(args)

    return ingredient as PopulatedIngredient
  } catch (error) {
    console.error("Error fetching ingredient:", error)
    return null
  }
}

import "server-only"

import prisma from "@/lib/db/db"
import { Prisma } from "@prisma/client"
import { PopulatedRecipe } from "@/types/types"

export const getRecipes = async (args?: Prisma.RecipeFindManyArgs) => {
  try {
    const recipes = await prisma.recipe.findMany({
      ...args,
    })

    return recipes as PopulatedRecipe[]
  } catch (error) {
    console.error("Error fetching recipes:", error)
    return null
  }
}

export const getRecipe = async (args: Prisma.RecipeFindFirstArgs) => {
  try {
    const recipe = await prisma.recipe.findFirst(args)

    return recipe as PopulatedRecipe
  } catch (error) {
    console.error("Error fetching recipe:", error)
    return null
  }
}

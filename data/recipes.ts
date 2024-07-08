"use server"

import prisma from "@/lib/db/db"
import { Recipe } from "@prisma/client"

export const getRecipes = async (): Promise<Recipe[] | null> => {
  try {
    const recipes = await prisma.recipe.findMany()

    return recipes
  } catch (error) {
    console.error(error)
    return null
  }
}

export const getRecipe = async (params: {
  where: {
    id?: string
    description?: string
  }
}): Promise<Recipe | null> => {
  try {
    const recipe = await prisma.recipe.findFirst(params)

    return recipe
  } catch (error) {
    console.error(error)
    return null
  }
}

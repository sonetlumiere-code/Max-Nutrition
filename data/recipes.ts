"use server"

import prisma from "@/lib/db/db"
import { PopulatedRecipe } from "@/types/types"

export const getRecipes = async (params?: {
  include?: {
    ingredients?: boolean
    product?: boolean
  }
}) => {
  try {
    const recipes = await prisma.recipe.findMany({
      ...params,
    })

    return recipes as PopulatedRecipe[]
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
  include?: {
    ingredients?: boolean
    product?: boolean
  }
}) => {
  try {
    const recipe = await prisma.recipe.findFirst({
      ...params,
    })

    return recipe as PopulatedRecipe
  } catch (error) {
    console.error(error)
    return null
  }
}

"use server"

import prisma from "@/lib/db/db"

export const getRecipes = async () => {
  try {
    const recipes = await prisma.recipe.findMany({
      include: {
        ingredients: true,
      },
    })

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
}) => {
  try {
    const recipe = await prisma.recipe.findFirst({
      ...params,
      include: {
        ingredients: true,
      },
    })

    return recipe
  } catch (error) {
    console.error(error)
    return null
  }
}

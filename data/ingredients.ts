"use server"

import prisma from "@/lib/db/db"

export const getIngredients = async () => {
  try {
    const ingredients = await prisma.ingredient.findMany({
      orderBy: {
        name: "asc",
      },
      // include: {
      //   recipes: true,
      // },
    })

    return ingredients
  } catch (error) {
    console.error("Error fetching ingredients:", error)
    return null
  }
}

export const getIngredient = async (params: {
  where: {
    id?: string
    name?: string
  }
}) => {
  try {
    const ingredient = await prisma.ingredient.findFirst({
      ...params,
      // include: {
      //   recipes: true,
      // },
    })

    return ingredient
  } catch (error) {
    console.error("Error fetching ingredient:", error)
    return null
  }
}

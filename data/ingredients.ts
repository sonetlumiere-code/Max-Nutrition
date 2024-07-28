"use server"

import prisma from "@/lib/db/db"
import { PopulatedIngredient } from "@/types/types"

export const getIngredients = async (params?: {
  orderBy?: {
    name: "asc" | "desc"
  }
  include?: {
    recipes?: boolean
  }
}) => {
  try {
    const ingredients = await prisma.ingredient.findMany({
      ...params,
    })

    return ingredients as PopulatedIngredient[]
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
  include?: {
    recipes?: boolean
  }
}) => {
  try {
    const ingredient = await prisma.ingredient.findFirst({
      ...params,
    })

    return ingredient as PopulatedIngredient
  } catch (error) {
    console.error("Error fetching ingredient:", error)
    return null
  }
}

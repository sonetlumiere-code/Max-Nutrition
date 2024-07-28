import { Ingredient, Product, Recipe, RecipeIngredient } from "@prisma/client"

export type PopulatedRecipe = Recipe & {
  ingredients?: RecipeIngredient[]
  product?: Product
}

export type PopulatedProduct = Product & {
  recipe?: Recipe
}

export type PopulatedIngredient = Ingredient & {
  recipes?: RecipeIngredient[]
}

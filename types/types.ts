import {
  Category,
  Ingredient,
  Product,
  PromotionCategory,
  Recipe,
  RecipeIngredient,
} from "@prisma/client"

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

export type PopulatedCategory = Category & {
  products?: Category[]
  promotions?: PromotionCategory[]
}

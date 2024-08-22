import {
  Category,
  Ingredient,
  Product,
  Promotion,
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
  categories?: Category[]
}

export type PopulatedIngredient = Ingredient & {
  recipes?: RecipeIngredient[]
}

export type PopulatedCategory = Category & {
  products?: Product[]
  promotions?: PromotionCategory[]
}

export type PopulatedPromotion = Promotion & {
  categories?: PromotionCategory[]
}

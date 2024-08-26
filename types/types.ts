import {
  Category,
  Ingredient,
  Order,
  OrderItem,
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

export type PopulatedOrder = Order & {
  items?: PopulatedOrderItem[]
}

export type PopulatedOrderItem = OrderItem & {
  product: Product
}

export type Variation = { [key: string]: boolean }

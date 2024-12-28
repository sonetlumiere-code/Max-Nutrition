import {
  Category,
  Customer,
  CustomerAddress,
  Ingredient,
  Measurement,
  Order,
  OrderItem,
  Product,
  Promotion,
  PromotionCategory,
  Recipe,
  RecipeIngredient,
  User,
} from "@prisma/client"

export type PopulatedRecipe = Recipe & {
  ingredients?: PopulatedRecipeIngredient[]
  product?: Product
}

export type PopulatedProduct = Product & {
  recipe?: PopulatedRecipe
  categories?: PopulatedCategory[]
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
  customer?: PopulatedCustomer
  address?: CustomerAddress
}

export type PopulatedOrderItem = OrderItem & {
  product: PopulatedProduct
}

export type PopulatedCustomer = Customer & {
  address?: CustomerAddress[]
  orders?: Order[]
  user?: Partial<User>
}

export type PopulatedRecipeIngredient = RecipeIngredient & {
  ingredient: Ingredient
}

export type Variation = {
  withSalt: boolean
}
export interface IngredientTotal {
  ingredientId: string
  name: string
  measurement: Measurement
  quantity: number
  cost: number
  waste: number // Ver acá lucas si es necesario (lo aplicó  Cursor)
}

export type TimePeriod = "week" | "month" | "year" | "all"

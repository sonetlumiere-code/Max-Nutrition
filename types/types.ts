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
  ingredient?: Ingredient
}

export type Variation = {
  withSalt: boolean
}
export interface IngredientTotal {
  ingredientId: string
  name: string
  measurement: Measurement
  total: number
}

export type TimePeriod = "week" | "month" | "year" | "all"

export interface Province {
  id: string
  nombre: string
}

export interface Municipality {
  id: string
  nombre: string
}

export interface Locality {
  id: string
  nombre: string
}

export interface Address {
  calle: { nombre: string; id: string }
  provincia: { nombre: string }
  departamento: { nombre: string }
  altura: { valor: number }
  nomenclatura: string
}

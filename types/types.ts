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
  ShopBranch,
  OperationalHours,
  ShopSettings,
  ShippingZone,
  ShippingSettings,
  AppliedPromotion,
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
  products: Product[]
  promotions?: PromotionCategory[]
}

export type PopulatedPromotion = Promotion & {
  categories?: PromotionCategory[]
}

export type PopulatedOrder = Order & {
  items?: PopulatedOrderItem[]
  customer?: PopulatedCustomer
  address?: CustomerAddress
  appliedPromotions?: AppliedPromotion[]
  shopBranch?: ShopBranch
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
  baseQuantity: number
  totalQuantity: number
  cost: number
  waste: number
}

export type PopulatedShopSettings = ShopSettings & {
  branches?: PopulatedShopBranch[]
  shippingSettings?: ShippingSettings
  shippingZones?: ShippingZone[]
}

export type PopulatedShippingSettings = ShippingSettings & {
  shopSettings?: ShopSettings
}

export type PopulatedShopBranch = ShopBranch & {
  operationalHours: OperationalHours[]
}

export type TimePeriod = "week" | "month" | "year" | "all"

export type PromotionToApply = PopulatedPromotion & {
  appliedTimes: number
}

export type LineItem = {
  id: string
  product: PopulatedProduct
  quantity: number
  variation: Variation
}

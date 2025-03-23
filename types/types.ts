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
  Role,
  Permission,
  ActionKey,
  SubjectKey,
  ProductRecipe,
  ProductRecipeType,
  Shop,
  DayOfWeek,
} from "@prisma/client"

export type PopulatedSafeUser = Omit<User, "password"> & {
  role?: PopulatedRole
}

export type PopulatedUser = User & {
  role?: PopulatedRole
}

export type PopulatedRole = Role & {
  permissions: Permission[]
  users: PopulatedUser[]
}

export type PopulatedShop = Shop & {
  operationalHours?: OperationalHours[]
}

export type PopulatedRecipe = Recipe & {
  recipeIngredients?: PopulatedRecipeIngredient[]
  product?: Product
}

export type PopulatedProduct = Product & {
  productRecipes?: PopulatedProductRecipe[]
  categories?: PopulatedCategory[]
}

export type PopulatedIngredient = Ingredient & {
  recipeIngredients?: RecipeIngredient[]
}

export type PopulatedCategory = Category & {
  products: Product[]
  promotions?: PromotionCategory[]
}

export type PopulatedPromotion = Promotion & {
  categories?: PromotionCategory[]
}

export type PopulatedOrder = Order & {
  shop?: Shop
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
  addresses?: CustomerAddress[]
  orders?: Order[]
  user?: Partial<User>
}

export type PopulatedRecipeIngredient = RecipeIngredient & {
  ingredient?: Ingredient
  recipe?: Recipe
}

export type PopulatedProductRecipe = ProductRecipe & {
  recipe?: PopulatedRecipe
  product?: PopulatedProduct
  type?: ProductRecipeType
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

export const BaseMeasurement = {
  UNIT: Measurement.UNIT,
  GRAM: Measurement.GRAM,
  MILLILITER: Measurement.MILLILITER,
} as const

export type BaseMeasurement = keyof typeof BaseMeasurement

export type PermissionKey = `${ActionKey}:${SubjectKey}`

export type HourGroup = {
  startDay: DayOfWeek
  endDay: DayOfWeek
  startTime: string
  endTime: string
}

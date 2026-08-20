import { calculateIngredientData } from "@/helpers/helpers"
import { ingredientsForVariant } from "@/helpers/recipe-variants"
import {
  IngredientTotal,
  PopulatedOrder,
  PopulatedRecipeIngredient,
} from "@/types/types"

/**
 * Agregaciones de producción a partir de los pedidos.
 *
 * Son funciones puras y sin dependencias del entorno para que la pantalla de
 * planificación y la exportación a Excel calculen exactamente lo mismo: si esta
 * lógica viviera duplicada, los dos números se separarían con el tiempo.
 */

export type ProductTotal = {
  name: string
  withSalt: number
  withoutSalt: number
  total: number
}

export type RecipeGroup = {
  productId: string
  productName: string
  productRecipeType: string
  totalQuantityForGroup: number
  ingredients: IngredientTotal[]
}

export type ProductGroup = {
  productId: string
  productName: string
  totalQuantitySold: number
  totalCost: number
  recipeGroups: RecipeGroup[]
}

export type Bags = {
  customers: string[]
  products: string[]
  rows: { customer: string; quantities: Record<string, number> }[]
}

const UNNAMED_CUSTOMER = "N/A"

/** Acumula un ingrediente de receta dentro de un mapa de totales. */
const accumulateIngredient = (
  totals: Record<string, IngredientTotal>,
  ingredientEntry: PopulatedRecipeIngredient,
  itemQuantity: number
) => {
  const ingredient = ingredientEntry.ingredient
  if (!ingredient) return

  const { adjustedQuantity, totalQuantity, cost, baseMeasurement } =
    calculateIngredientData({
      ingredient,
      quantity: ingredientEntry.quantity,
      withWaste: true,
    })

  const scaled = {
    baseQuantity: adjustedQuantity * itemQuantity,
    totalQuantity: totalQuantity * itemQuantity,
    cost: cost * itemQuantity,
  }

  const existing = totals[ingredient.id]

  if (existing) {
    existing.baseQuantity += scaled.baseQuantity
    existing.totalQuantity += scaled.totalQuantity
    existing.cost += scaled.cost
    return
  }

  totals[ingredient.id] = {
    ingredientId: ingredient.id,
    name: ingredient.name,
    measurement: baseMeasurement,
    baseQuantity: scaled.baseQuantity,
    totalQuantity: scaled.totalQuantity,
    cost: scaled.cost,
    waste: ingredient.waste,
  }
}

/** Unidades a producir de cada producto, separadas por variante. */
export const aggregateProducts = (orders: PopulatedOrder[]): ProductTotal[] => {
  const summary: Record<string, ProductTotal> = {}

  orders.forEach((order) => {
    order.items?.forEach((item) => {
      const name = item.product.name
      const entry = (summary[name] ??= {
        name,
        withSalt: 0,
        withoutSalt: 0,
        total: 0,
      })

      if (item.withSalt) {
        entry.withSalt += item.quantity
      } else {
        entry.withoutSalt += item.quantity
      }
      entry.total += item.quantity
    })
  })

  return Object.values(summary)
}

/** Ingredientes totales a comprar, con merma y costo incluidos. */
export const aggregateIngredients = (
  orders: PopulatedOrder[]
): IngredientTotal[] => {
  const totals: Record<string, IngredientTotal> = {}

  orders.forEach((order) => {
    order.items?.forEach((item) => {
      item.product.productRecipes?.forEach((productRecipe) => {
        // Un pedido sin sal no compra la sal: la variante del ítem decide qué
        // ingredientes de la receta entran en la lista de compras.
        ingredientsForVariant(
          productRecipe.recipe?.recipeIngredients,
          item.withSalt
        ).forEach((ingredientEntry) => {
          accumulateIngredient(totals, ingredientEntry, item.quantity)
        })
      })
    })
  })

  return Object.values(totals)
}

/** Detalle por producto y tipo de receta, para la cocina. */
export const aggregateRecipeGroups = (
  orders: PopulatedOrder[]
): ProductGroup[] => {
  const groups: Record<
    string,
    Omit<RecipeGroup, "ingredients"> & {
      ingredientTotals: Record<string, IngredientTotal>
    }
  > = {}

  orders.forEach((order) => {
    order.items?.forEach((item) => {
      const product = item.product

      product.productRecipes?.forEach((productRecipe) => {
        const recipeTypeName =
          productRecipe.type?.name || "Tipo de receta no especificada"
        const key = `${product.id}-${recipeTypeName}`

        const group = (groups[key] ??= {
          productId: product.id,
          productName: product.name,
          productRecipeType: recipeTypeName,
          totalQuantityForGroup: 0,
          ingredientTotals: {},
        })

        group.totalQuantityForGroup += item.quantity

        ingredientsForVariant(
          productRecipe.recipe?.recipeIngredients,
          item.withSalt
        ).forEach((ingredientEntry) => {
          accumulateIngredient(
            group.ingredientTotals,
            ingredientEntry,
            item.quantity
          )
        })
      })
    })
  })

  // Unidades vendidas por producto, para encabezar cada bloque.
  const productQuantities: Record<string, number> = {}
  orders.forEach((order) => {
    order.items?.forEach((item) => {
      productQuantities[item.product.id] =
        (productQuantities[item.product.id] || 0) + item.quantity
    })
  })

  const productGroups: Record<string, ProductGroup> = {}

  Object.values(groups).forEach((group) => {
    const ingredients = Object.values(group.ingredientTotals)
    const groupCost = ingredients.reduce(
      (sum, ingredient) => sum + ingredient.cost,
      0
    )

    const productGroup = (productGroups[group.productId] ??= {
      productId: group.productId,
      productName: group.productName,
      totalQuantitySold: productQuantities[group.productId] || 0,
      totalCost: 0,
      recipeGroups: [],
    })

    productGroup.totalCost += groupCost
    productGroup.recipeGroups.push({
      productId: group.productId,
      productName: group.productName,
      productRecipeType: group.productRecipeType,
      totalQuantityForGroup: group.totalQuantityForGroup,
      ingredients,
    })
  })

  return Object.values(productGroups)
}

/** Qué lleva el bolsón de cada cliente, para el armado de los pedidos. */
export const aggregateBags = (orders: PopulatedOrder[]): Bags => {
  const customers = Array.from(
    new Set(orders.map((order) => order.customer?.name || UNNAMED_CUSTOMER))
  )

  const products = Array.from(
    new Set(
      orders.flatMap(
        (order) => order.items?.map((item) => item.product.name) || []
      )
    )
  )

  const rows = customers.map((customer) => {
    const quantities: Record<string, number> = {}

    products.forEach((product) => {
      quantities[product] = orders
        .filter(
          (order) => (order.customer?.name || UNNAMED_CUSTOMER) === customer
        )
        .flatMap((order) => order.items || [])
        .filter((item) => item.product.name === product)
        .reduce((sum, item) => sum + item.quantity, 0)
    })

    return { customer, quantities }
  })

  return { customers, products, rows }
}

import "server-only"

import prisma from "@/lib/db/db"
import { DateRangeBounds } from "@/helpers/date-range"
import {
  aggregateBags,
  aggregateIngredients,
  aggregateProducts,
  aggregateRecipeGroups,
} from "@/helpers/production"
import { PopulatedOrder } from "@/types/types"
import { OrderStatus } from "@prisma/client"

export type ProductionScope = "pending" | "committed" | "all"

export const PRODUCTION_SCOPES: Record<
  ProductionScope,
  { label: string; statuses: OrderStatus[] }
> = {
  pending: { label: "Pendientes", statuses: [OrderStatus.PENDING] },
  committed: {
    label: "Pendientes y aceptados",
    statuses: [OrderStatus.PENDING, OrderStatus.ACCEPTED],
  },
  all: {
    label: "Todos menos cancelados",
    statuses: [
      OrderStatus.PENDING,
      OrderStatus.ACCEPTED,
      OrderStatus.COMPLETED,
    ],
  },
}

export const getProductionPlan = async (
  range: DateRangeBounds,
  scope: ProductionScope
) => {
  const { start, end } = range

  const orders = (await prisma.order.findMany({
    where: {
      createdAt: { gte: start, lte: end },
      status: { in: PRODUCTION_SCOPES[scope].statuses },
    },
    include: {
      customer: { select: { name: true } },
      items: {
        include: {
          product: {
            include: {
              productRecipes: {
                include: {
                  type: true,
                  recipe: {
                    include: { recipeIngredients: { include: { ingredient: true } } },
                  },
                },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  })) as unknown as PopulatedOrder[]

  const ingredients = aggregateIngredients(orders)

  return {
    range: { start, end },
    orderCount: orders.length,
    products: aggregateProducts(orders).sort((a, b) => b.total - a.total),
    // Los ingredientes más caros primero: son los que más conviene revisar.
    ingredients: [...ingredients].sort((a, b) => b.cost - a.cost),
    ingredientsCost: ingredients.reduce(
      (sum, ingredient) => sum + ingredient.cost,
      0
    ),
    unitsToProduce: orders.reduce(
      (sum, order) =>
        sum + (order.items?.reduce((acc, item) => acc + item.quantity, 0) || 0),
      0
    ),
    recipeGroups: aggregateRecipeGroups(orders),
    bags: aggregateBags(orders),
  }
}

export type ProductionPlan = Awaited<ReturnType<typeof getProductionPlan>>

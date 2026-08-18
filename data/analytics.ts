import "server-only"

import prisma from "@/lib/db/db"
import { calculateIngredientData, toBusinessTime } from "@/helpers/helpers"
import { getPeriodRange } from "@/helpers/date-range"
import { AnalyticsPeriod } from "@/types/types"
import { OrderStatus, Prisma } from "@prisma/client"

// Los pedidos cancelados no cuentan como venta en ninguna métrica.
const SALES_STATUS_FILTER = { not: OrderStatus.CANCELLED }

const MONTH_LABELS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
]

const WEEKDAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

/** Buckets vacíos del período, en orden cronológico. */
const buildBuckets = (period: AnalyticsPeriod) => {
  const nowBusiness = toBusinessTime(new Date())

  if (period === "week") {
    return WEEKDAY_LABELS.map((label, index) => ({
      key: String(index),
      label,
      value: 0,
    }))
  }

  if (period === "month") {
    const daysInMonth = new Date(
      nowBusiness.getFullYear(),
      nowBusiness.getMonth() + 1,
      0
    ).getDate()

    return Array.from({ length: daysInMonth }, (_, index) => ({
      key: String(index + 1),
      label: String(index + 1),
      value: 0,
    }))
  }

  return MONTH_LABELS.map((label, index) => ({
    key: String(index),
    label,
    value: 0,
  }))
}

const bucketKeyFor = (date: Date, period: AnalyticsPeriod) => {
  const business = toBusinessTime(date)

  if (period === "week") {
    return String((business.getDay() + 6) % 7)
  }
  if (period === "month") {
    return String(business.getDate())
  }
  return String(business.getMonth())
}

/** Costo de ingredientes de cada producto, según sus recetas actuales. */
const getProductCosts = async () => {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      price: true,
      productRecipes: {
        select: {
          recipe: {
            select: {
              recipeIngredients: {
                select: { quantity: true, ingredient: true },
              },
            },
          },
        },
      },
    },
  })

  return new Map(
    products.map((product) => {
      const cost = product.productRecipes.reduce((total, productRecipe) => {
        const ingredients = productRecipe.recipe?.recipeIngredients ?? []

        return (
          total +
          ingredients.reduce((sum, entry) => {
            if (!entry.ingredient) return sum

            return (
              sum +
              calculateIngredientData({
                ingredient: entry.ingredient,
                quantity: entry.quantity,
                withWaste: true,
              }).cost
            )
          }, 0)
        )
      }, 0)

      return [product.id, { name: product.name, price: product.price, cost }]
    })
  )
}

const sumOrders = async (where: Prisma.OrderWhereInput) => {
  const result = await prisma.order.aggregate({
    where,
    _sum: { total: true, shippingCost: true },
    _count: { _all: true },
  })

  return {
    revenue: result._sum.total ?? 0,
    shipping: result._sum.shippingCost ?? 0,
    orders: result._count._all,
  }
}

export const getAnalytics = async (period: AnalyticsPeriod) => {
  const { start, end, previousStart, previousEnd } = getPeriodRange(period)

  const currentWhere: Prisma.OrderWhereInput = {
    createdAt: { gte: start, lte: end },
    status: SALES_STATUS_FILTER,
  }

  const [current, previous, orders, items, statusGroups, productCosts] =
    await Promise.all([
      sumOrders(currentWhere),
      sumOrders({
        createdAt: { gte: previousStart, lt: previousEnd },
        status: SALES_STATUS_FILTER,
      }),
      prisma.order.findMany({
        where: currentWhere,
        select: {
          createdAt: true,
          total: true,
          customerId: true,
          customer: { select: { name: true } },
        },
      }),
      prisma.orderItem.findMany({
        where: { order: currentWhere },
        select: {
          productId: true,
          quantity: true,
          unitPrice: true,
          product: { select: { name: true, price: true } },
        },
      }),
      prisma.order.groupBy({
        by: ["status"],
        where: { createdAt: { gte: start, lte: end } },
        _count: { _all: true },
      }),
      getProductCosts(),
    ])

  // Serie temporal de ingresos.
  const buckets = buildBuckets(period)
  const bucketIndex = new Map(buckets.map((bucket) => [bucket.key, bucket]))

  orders.forEach((order) => {
    const bucket = bucketIndex.get(bucketKeyFor(order.createdAt, period))
    if (bucket) bucket.value += order.total
  })

  // Productos vendidos: unidades, facturación y costo de ingredientes.
  const productTotals = new Map<
    string,
    { name: string; quantity: number; revenue: number; cost: number }
  >()

  items.forEach((item) => {
    const reference = productCosts.get(item.productId)
    const name = item.product?.name ?? reference?.name ?? "Producto eliminado"
    const unitPrice = item.unitPrice ?? item.product?.price ?? 0
    const entry = productTotals.get(item.productId) ?? {
      name,
      quantity: 0,
      revenue: 0,
      cost: 0,
    }

    entry.quantity += item.quantity
    entry.revenue += unitPrice * item.quantity
    entry.cost += (reference?.cost ?? 0) * item.quantity

    productTotals.set(item.productId, entry)
  })

  const products = Array.from(productTotals.values())
  const ingredientsCost = products.reduce((sum, item) => sum + item.cost, 0)

  // El envío no es margen: se descuenta antes de comparar contra el costo.
  const netRevenue = current.revenue - current.shipping
  const grossMargin = netRevenue - ingredientsCost

  // Clientes del período.
  const customerTotals = new Map<
    string,
    { name: string; orders: number; total: number }
  >()

  orders.forEach((order) => {
    const entry = customerTotals.get(order.customerId) ?? {
      name: order.customer?.name ?? "Sin nombre",
      orders: 0,
      total: 0,
    }
    entry.orders += 1
    entry.total += order.total
    customerTotals.set(order.customerId, entry)
  })

  const customers = Array.from(customerTotals.values()).sort(
    (a, b) => b.total - a.total
  )

  // Rentabilidad por producto, sobre el catálogo con receta cargada.
  const margins = Array.from(productCosts.values())
    .filter((product) => product.cost > 0)
    .map((product) => ({
      ...product,
      margin: product.price - product.cost,
      marginPct:
        product.price > 0
          ? ((product.price - product.cost) / product.price) * 100
          : 0,
    }))
    .sort((a, b) => a.marginPct - b.marginPct)

  return {
    range: { start, end },
    kpis: {
      revenue: current.revenue,
      previousRevenue: previous.revenue,
      orders: current.orders,
      previousOrders: previous.orders,
      averageTicket: current.orders ? current.revenue / current.orders : 0,
      previousAverageTicket: previous.orders
        ? previous.revenue / previous.orders
        : 0,
      grossMargin,
      marginPct: netRevenue > 0 ? (grossMargin / netRevenue) * 100 : 0,
      ingredientsCost,
      shipping: current.shipping,
    },
    timeSeries: buckets,
    topProducts: [...products].sort((a, b) => b.quantity - a.quantity),
    margins,
    customers,
    statusBreakdown: statusGroups.map((group) => ({
      status: group.status,
      count: group._count._all,
    })),
  }
}

export type Analytics = Awaited<ReturnType<typeof getAnalytics>>

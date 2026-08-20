import { OrderStatus, PaymentStatus, Prisma } from "@prisma/client"
import { RECIPES_DETAIL } from "@/helpers/orders-query"

/**
 * Traduce los parámetros de consulta de la lista de pedidos al filtro de
 * Prisma. Todo es opcional y lo inválido se ignora en silencio: la lista sin
 * filtros es una respuesta válida, así que un parámetro mal formado no debería
 * romper la página, solo dejar de acotar.
 *
 * Vive aparte de la ruta para poder testearlo sin levantar el servidor, y
 * aparte de `helpers/orders-query.ts` porque eso lo importa el cliente y acá se
 * usan los enums de Prisma.
 */
export const buildOrdersWhere = (
  searchParams: URLSearchParams
): Prisma.OrderWhereInput => {
  const where: Prisma.OrderWhereInput = {}

  const status = searchParams.get("status")
  if (status && Object.values(OrderStatus).includes(status as OrderStatus)) {
    where.status = status as OrderStatus
  }

  const paymentStatus = searchParams.get("paymentStatus")
  if (
    paymentStatus &&
    Object.values(PaymentStatus).includes(paymentStatus as PaymentStatus)
  ) {
    where.paymentStatus = paymentStatus as PaymentStatus
  }

  const shopId = searchParams.get("shopId")
  if (shopId) {
    where.shopId = shopId
  }

  const shopBranchId = searchParams.get("shopBranchId")
  if (shopBranchId) {
    where.shopBranchId = shopBranchId
  }

  const customerId = searchParams.get("customerId")
  if (customerId) {
    where.customerId = customerId
  }

  const createdAt: Prisma.DateTimeFilter = {}

  const gte = parseDate(searchParams.get("createdAt[gte]"))
  if (gte) createdAt.gte = gte

  const lte = parseDate(searchParams.get("createdAt[lte]"))
  if (lte) createdAt.lte = lte

  if (Object.keys(createdAt).length) {
    where.createdAt = createdAt
  }

  return where
}

const parseDate = (value: string | null) => {
  if (!value) return null

  const parsed = new Date(value)

  return isNaN(parsed.getTime()) ? null : parsed
}

/**
 * Include de Prisma para la lista de pedidos. Por defecto trae lo que la tabla
 * y el panel de detalle muestran; con `detail=recipes` agrega el árbol de
 * recetas de cada producto, que solo usa la exportación a Excel.
 *
 * La distinción importa: ese árbol se serializa una vez por ítem de pedido, así
 * que un pedido de diez viandas repite diez veces las mismas recetas.
 */
export const buildOrdersInclude = (
  searchParams: URLSearchParams
): Prisma.OrderInclude => {
  const withRecipes = searchParams.get("detail") === RECIPES_DETAIL

  return {
    items: {
      include: {
        product: withRecipes
          ? {
              include: {
                productRecipes: {
                  include: {
                    recipe: {
                      include: {
                        productRecipes: true,
                        recipeIngredients: {
                          include: {
                            ingredient: true,
                          },
                        },
                      },
                    },
                    type: true,
                  },
                },
              },
            }
          : true,
      },
    },
    customer: {
      include: {
        user: {
          select: {
            email: true,
            image: true,
          },
        },
        // Solo el conteo: embeber el historial completo de cada cliente
        // multiplica el payload cuadráticamente.
        _count: {
          select: {
            orders: true,
          },
        },
      },
    },
    address: true,
    appliedPromotions: true,
    shop: true,
    shopBranch: true,
  }
}

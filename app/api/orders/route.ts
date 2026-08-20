import { NextRequest, NextResponse } from "next/server"
import { getOrders } from "@/data/orders"
import { hasPermission } from "@/helpers/helpers"
import { buildOrdersWhere } from "@/lib/orders/list-filters"
import { verifySession } from "@/lib/auth/verify-session"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const session = await verifySession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  if (!hasPermission(session.user, "view:orders")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const where = buildOrdersWhere(req.nextUrl.searchParams)

    const orders = await getOrders({
      where,
      include: {
        items: {
          include: {
            product: {
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
            },
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
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    )
  }
}

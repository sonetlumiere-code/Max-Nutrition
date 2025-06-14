import { NextRequest, NextResponse } from "next/server"
import { getOrders } from "@/data/orders"
import { OrderStatus, PaymentStatus, Prisma } from "@prisma/client"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams

    const status = searchParams.get("status") as OrderStatus | null
    const paymentStatus = searchParams.get(
      "paymentStatus"
    ) as PaymentStatus | null
    const shopId = searchParams.get("shopId") ?? undefined
    const shopBranchId = searchParams.get("shopBranchId") ?? undefined
    const customerId = searchParams.get("customerId") ?? undefined
    const createdAtGte = searchParams.get("createdAt[gte]")
    const createdAtLte = searchParams.get("createdAt[lte]")

    const where: Prisma.OrderWhereInput = {}

    if (status && Object.values(OrderStatus).includes(status)) {
      where.status = status
    }

    if (paymentStatus && Object.values(PaymentStatus).includes(paymentStatus)) {
      where.paymentStatus = paymentStatus
    }

    if (shopId) {
      where.shopId = shopId
    }

    if (shopBranchId) {
      where.shopBranchId = shopBranchId
    }

    if (customerId) {
      where.customerId = customerId
    }

    if (createdAtGte || createdAtLte) {
      where.createdAt = {}
      if (createdAtGte) {
        const parsed = new Date(createdAtGte)
        if (!isNaN(parsed.getTime())) where.createdAt.gte = parsed
      }
      if (createdAtLte) {
        const parsed = new Date(createdAtLte)
        if (!isNaN(parsed.getTime())) where.createdAt.lte = parsed
      }
    }

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
            orders: true,
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

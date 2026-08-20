import { NextRequest, NextResponse } from "next/server"
import { getOrders } from "@/data/orders"
import { hasPermission } from "@/helpers/helpers"
import { buildOrdersInclude, buildOrdersWhere } from "@/lib/orders/list-filters"
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
    const searchParams = req.nextUrl.searchParams

    const orders = await getOrders({
      where: buildOrdersWhere(searchParams),
      include: buildOrdersInclude(searchParams),
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

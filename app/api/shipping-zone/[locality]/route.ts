import { NextRequest, NextResponse } from "next/server"
import { getShippingZone } from "@/data/shipping-zones"
import { Prisma } from "@prisma/client"

export const dynamic = "force-dynamic"

export async function GET(
  req: NextRequest,
  { params }: { params: { locality: string } }
) {
  try {
    const searchParams = req.nextUrl.searchParams

    const {
      province,
      municipality,
      isActive: isActiveParam,
      shopSettingsId,
      cost: costParam,
    } = Object.fromEntries(searchParams.entries())

    const locality = params.locality

    const where: Prisma.ShippingZoneWhereInput = { locality }

    if (province) where.province = province
    if (municipality) where.municipality = municipality
    if (shopSettingsId) where.shopSettingsId = shopSettingsId
    if (isActiveParam !== undefined) where.isActive = isActiveParam === "true"
    if (costParam !== undefined && !isNaN(parseFloat(costParam))) {
      where.cost = parseFloat(costParam)
    }

    const shippingZone = await getShippingZone({ where })

    if (!shippingZone) {
      return NextResponse.json(
        { error: "Shipping zone not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(shippingZone)
  } catch (error) {
    console.error(
      "Unexpected error in GET /api/shipping-zone/[locality]:",
      error
    )
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

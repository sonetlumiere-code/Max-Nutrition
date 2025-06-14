import { NextRequest, NextResponse } from "next/server"
import { getPromotions } from "@/data/promotions"
import { PromotionDiscountType, ShopCategory } from "@prisma/client"
import { Prisma } from "@prisma/client"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams

    const name = searchParams.get("name") ?? undefined
    const description = searchParams.get("description") ?? undefined
    const shopCategory = searchParams.get("shopCategory") as ShopCategory | null
    const discountType = searchParams.get(
      "discountType"
    ) as PromotionDiscountType | null
    const isActiveParam = searchParams.get("isActive")
    const discountParam = searchParams.get("discount")
    const maxApplicableTimesParam = searchParams.get("maxApplicableTimes")

    const where: Prisma.PromotionWhereInput = {}

    if (name) where.name = { contains: name, mode: "insensitive" }
    if (description)
      where.description = { contains: description, mode: "insensitive" }

    if (shopCategory && Object.values(ShopCategory).includes(shopCategory)) {
      where.shopCategory = shopCategory
    }

    if (
      discountType &&
      Object.values(PromotionDiscountType).includes(discountType)
    ) {
      where.discountType = discountType
    }

    if (isActiveParam !== null) {
      where.isActive = isActiveParam === "true"
    }

    if (discountParam && !isNaN(parseFloat(discountParam))) {
      where.discount = parseFloat(discountParam)
    }

    if (maxApplicableTimesParam && !isNaN(parseInt(maxApplicableTimesParam))) {
      where.maxApplicableTimes = parseInt(maxApplicableTimesParam)
    }

    const promotions = await getPromotions({
      where,
      include: {
        categories: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(promotions)
  } catch (error) {
    console.error("Unexpected error in GET /api/promotions:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

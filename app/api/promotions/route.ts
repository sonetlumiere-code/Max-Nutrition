import { NextRequest, NextResponse } from "next/server"
import { getPromotions } from "@/data/promotions"
import { ShopCategory } from "@prisma/client"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const shopCategory = searchParams.get("shopCategory") as ShopCategory

    if (!shopCategory || !Object.values(ShopCategory).includes(shopCategory)) {
      return NextResponse.json(
        { error: "Invalid shopCategory" },
        { status: 400 }
      )
    }

    const promotions = await getPromotions({
      where: { isActive: true, shopCategory },
      include: { categories: true },
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

import { NextRequest, NextResponse } from "next/server"
import { getCategories } from "@/data/categories"
import { ShopCategory } from "@prisma/client"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const shopCategory = searchParams.get("shopCategory") as ShopCategory | null

    const where = {} as { shopCategory?: ShopCategory }

    if (shopCategory) {
      if (!Object.values(ShopCategory).includes(shopCategory)) {
        return NextResponse.json(
          { error: "Invalid shopCategory" },
          { status: 400 }
        )
      }
      where.shopCategory = shopCategory
    }

    const categories = await getCategories({
      where,
      include: {
        products: {
          where: { show: true },
          include: { categories: true },
        },
        promotions: true,
      },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error in GET /api/categories:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

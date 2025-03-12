"use server"

import { getPromotions } from "@/data/promotions"
import { calculatePromotions } from "@/helpers/helpers"
import { PopulatedProduct } from "@/types/types"
import { ShopCategory } from "@prisma/client"

type CheckPromotionProps = {
  items: {
    product: PopulatedProduct
    quantity: number
  }[]
  shopCategory: ShopCategory
}

export async function checkPromotion({
  items,
  shopCategory,
}: CheckPromotionProps) {
  const promotions = await getPromotions({
    where: { shopCategory },
    include: { categories: true },
  })

  return calculatePromotions({
    items,
    promotions: promotions || [],
  })
}

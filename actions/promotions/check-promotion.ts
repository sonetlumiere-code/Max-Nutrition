"use server"

import { getPromotions } from "@/data/promotions"
import { calculatePromotions } from "@/helpers/helpers"
import { PopulatedProduct } from "@/types/types"

type CheckPromotionProps = {
  items: {
    product: PopulatedProduct
    quantity: number
  }[]
}

export async function checkPromotion({ items }: CheckPromotionProps) {
  const promotions = await getPromotions({ include: { categories: true } })

  return calculatePromotions({
    items,
    promotions: promotions || [],
  })
}

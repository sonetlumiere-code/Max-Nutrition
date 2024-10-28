"use server"

import prisma from "@/lib/db/db"
import { promotionSchema } from "@/lib/validations/promotion-validation"
import { revalidatePath } from "next/cache"
import { z } from "zod"

type PromotionSchema = z.infer<typeof promotionSchema>

export async function createPromotion(values: PromotionSchema) {
  const validatedFields = promotionSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campos inválidos." }
  }

  const {
    name,
    description,
    discountType,
    discount,
    isActive,
    categories,
    allowedPaymentMethods,
    allowedShippingMethods,
  } = validatedFields.data

  try {
    const promotion = await prisma.promotion.create({
      data: {
        name,
        description,
        discountType,
        discount,
        isActive,
        allowedPaymentMethods,
        allowedShippingMethods,
        categories: {
          create: categories.map((category) => ({
            categoryId: category.categoryId,
            quantity: category.quantity,
          })),
        },
      },
      include: {
        categories: true,
      },
    })

    revalidatePath("/promotions")

    return { success: promotion }
  } catch (error) {
    console.error("Error creating promotion:", error)
    return { error: "Hubo un error al crear la promoción." }
  }
}

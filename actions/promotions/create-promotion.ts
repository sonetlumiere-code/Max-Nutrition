"use server"

import { hasPermission } from "@/helpers/helpers"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/db/db"
import {
  PromotionSchema,
  promotionSchema,
} from "@/lib/validations/promotion-validation"
import { revalidatePath } from "next/cache"

export async function createPromotion(values: PromotionSchema) {
  const session = await auth()
  const user = session?.user

  if (!user) {
    return { error: "No autorizado." }
  }

  if (!hasPermission(session.user, "create:promotions")) {
    return { error: "No autorizado." }
  }

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
    shopCategory,
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
        shopCategory,
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

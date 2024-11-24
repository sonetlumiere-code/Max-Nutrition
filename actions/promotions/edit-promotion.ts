"use server"

import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/db/db"
import { promotionSchema } from "@/lib/validations/promotion-validation"
import { revalidatePath } from "next/cache"
import { z } from "zod"

type PromotionSchema = z.infer<typeof promotionSchema>

export async function editPromotion({
  id,
  values,
}: {
  id: string
  values: PromotionSchema
}) {
  const session = await auth()

  if (session?.user.role !== "ADMIN") {
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
    allowedPaymentMethods,
    allowedShippingMethods,
  } = validatedFields.data

  try {
    const updatedPromotion = await prisma.promotion.update({
      where: { id },
      data: {
        name,
        description,
        discountType,
        discount,
        isActive,
        allowedPaymentMethods,
        allowedShippingMethods,
        categories: {
          deleteMany: {},
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

    return { success: updatedPromotion }
  } catch (error) {
    console.error("Error updating promotion:", error)
    return { error: "Hubo un error al actualizar la promoción." }
  }
}

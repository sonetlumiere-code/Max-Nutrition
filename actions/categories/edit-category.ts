"use server"

import prisma from "@/lib/db/db"
import { categorySchema } from "@/lib/validations/category-validation"
import { revalidatePath } from "next/cache"
import { z } from "zod"

type CategorySchema = z.infer<typeof categorySchema>

export async function editCategory({
  id,
  values,
}: {
  id: string
  values: CategorySchema
}) {
  const validatedFields = categorySchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campos inválidos." }
  }

  const { name, productsIds, promotionsIds } = validatedFields.data

  try {
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name,
        products: {
          set: productsIds?.map((productId) => ({ id: productId })) || [],
        },
        promotions: {
          deleteMany: {},
          connect:
            promotionsIds?.map((promotionId) => ({ id: promotionId })) || [],
        },
      },
    })

    revalidatePath("/categories")

    return { success: updatedCategory }
  } catch (error) {
    console.error("Error updating category:", error)
    return { error: "Hubo un error al actualizar la categoría." }
  }
}

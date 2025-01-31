"use server"

import { hasPermission } from "@/helpers/helpers"
import { auth } from "@/lib/auth/auth"
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
  const session = await auth()
  const user = session?.user

  if (!user) {
    return { error: "No autorizado." }
  }

  if (!hasPermission(session.user, "update:categories")) {
    return { error: "No autorizado." }
  }

  const validatedFields = categorySchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campos inválidos." }
  }

  const { name, productsIds, promotionsIds, group } = validatedFields.data

  try {
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name,
        group,
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

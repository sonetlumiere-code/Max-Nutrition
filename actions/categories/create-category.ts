"use server"

import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/db/db"
import { categorySchema } from "@/lib/validations/category-validation"
import { Role } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { z } from "zod"

type CategorySchema = z.infer<typeof categorySchema>

export async function createCategory(values: CategorySchema) {
  const session = await auth()

  if (session?.user.role !== Role.ADMIN) {
    return { error: "No autorizado." }
  }

  const validatedFields = categorySchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campos inválidos." }
  }

  const { name, productsIds, promotionsIds } = validatedFields.data

  try {
    const newCategory = await prisma.category.create({
      data: {
        name,
        products: {
          connect: productsIds?.map((productId) => ({ id: productId })) || [],
        },
        promotions: {
          connect:
            promotionsIds?.map((promotionId) => ({ id: promotionId })) || [],
        },
      },
    })

    revalidatePath("/categories")

    return { success: newCategory }
  } catch (error) {
    console.error("Error creating category:", error)
    return { error: "Hubo un error al crear la categoría." }
  }
}

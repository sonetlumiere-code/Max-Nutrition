"use server"

import prisma from "@/lib/db/db"
import { productSchema } from "@/lib/validations/product-validation"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const partialProductSchema = productSchema.partial()

type PartialProductSchema = z.infer<typeof partialProductSchema>

export async function editProduct({
  id,
  values,
}: {
  id: string
  values: Partial<PartialProductSchema>
}) {
  const validatedFields = partialProductSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campos inválidos." }
  }

  const {
    name,
    description,
    price,
    promotionalPrice,
    image,
    featured,
    stock,
    show,
    recipeId,
    categoriesIds,
  } = validatedFields.data

  try {
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price,
        promotionalPrice,
        featured,
        stock,
        show,
        image,
        recipeId,
        categories: {
          set: categoriesIds?.map((id) => ({ id })) || [],
        },
      },
    })

    revalidatePath("/products")

    return { success: updatedProduct }
  } catch (error) {
    console.error("Error updating product:", error)
    return { error: "Hubo un error al actualizar el producto." }
  }
}

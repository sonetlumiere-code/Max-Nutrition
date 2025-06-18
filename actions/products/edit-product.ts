"use server"

import { hasPermission } from "@/helpers/helpers"
import { verifySession } from "@/lib/auth/verify-session"
import prisma from "@/lib/db/db"
import {
  partialProductSchema,
  PartialProductSchema,
} from "@/lib/validations/product-validation"
import { revalidatePath } from "next/cache"

export async function editProduct({
  id,
  values,
}: {
  id: string
  values: PartialProductSchema
}) {
  const session = await verifySession()
  const user = session?.user

  if (!user) {
    return { error: "No autorizado." }
  }

  if (!hasPermission(session.user, "update:products")) {
    return { error: "No autorizado." }
  }

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
    recipes,
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
        productRecipes: {
          deleteMany: {},
          create: recipes?.map(({ recipeId, typeId }) => ({
            recipe: { connect: { id: recipeId } },
            type: { connect: { id: typeId } },
          })),
        },
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

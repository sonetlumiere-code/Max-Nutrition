"use server"

import { hasPermission } from "@/helpers/helpers"
import { verifySession } from "@/lib/auth/verify-session"
import prisma from "@/lib/db/db"
import {
  ProductSchema,
  productSchema,
} from "@/lib/validations/product-validation"
import { revalidatePath } from "next/cache"

export async function createProduct(values: ProductSchema) {
  const session = await verifySession()
  const user = session?.user

  if (!user) {
    return { error: "No autorizado." }
  }

  if (!hasPermission(session.user, "create:products")) {
    return { error: "No autorizado." }
  }

  const validatedFields = productSchema.safeParse(values)

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
    const product = await prisma.product.create({
      data: {
        name,
        description: description || "",
        price,
        promotionalPrice: promotionalPrice || 0,
        image: image || "",
        featured,
        stock,
        show,
        productRecipes: {
          create: recipes.map(({ recipeId, typeId }) => ({
            recipe: { connect: { id: recipeId } },
            type: { connect: { id: typeId } },
          })),
        },
        categories: {
          connect:
            categoriesIds?.map((categoryId) => ({ id: categoryId })) || [],
        },
      },
    })

    revalidatePath("/products")

    return { success: product }
  } catch (error) {
    console.error("Error creating product:", error)
    return { error: "Hubo un error al crear el producto." }
  }
}

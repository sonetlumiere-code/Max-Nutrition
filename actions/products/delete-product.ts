"use server"

import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/db/db"
import { revalidatePath } from "next/cache"
import deleteImage from "../cloudinary/delete-image"
import { hasPermission } from "@/helpers/helpers"

export async function deleteProduct({ id }: { id: string }) {
  const session = await auth()

  const user = session?.user

  if (!user) {
    return { error: "No autorizado." }
  }

  if (!hasPermission(session.user, "delete:products")) {
    return { error: "No autorizado." }
  }

  try {
    const product = await prisma.product.delete({
      where: { id },
    })

    if (product.image) {
      deleteImage(product.image.split("/")[1])
    }

    revalidatePath("/products")

    return { success: product }
  } catch (error) {
    console.log(error)
    return { error: "Hubo un error al eliminar el producto." }
  }
}

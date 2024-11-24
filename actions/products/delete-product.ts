"use server"

import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/db/db"
import { revalidatePath } from "next/cache"
import deleteImage from "../cloudinary/delete-image"

export async function deleteProduct({ id }: { id: string }) {
  const session = await auth()

  if (session?.user.role !== "ADMIN") {
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

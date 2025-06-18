"use server"

import { verifySession } from "@/lib/auth/verify-session"
import prisma from "@/lib/db/db"
import { revalidatePath } from "next/cache"
import { hasPermission } from "@/helpers/helpers"

export async function deleteProductRecipeType({ id }: { id: string }) {
  const session = await verifySession()

  const user = session?.user

  if (!user) {
    return { error: "No autorizado." }
  }

  if (!hasPermission(session.user, "delete:productRecipeTypes")) {
    return { error: "No autorizado." }
  }

  try {
    const productRecipeType = await prisma.productRecipeType.delete({
      where: { id },
    })

    revalidatePath("/recipes")

    return { success: productRecipeType }
  } catch (error) {
    console.log(error)
    return { error: "Hubo un error al eliminar el tipo de receta." }
  }
}

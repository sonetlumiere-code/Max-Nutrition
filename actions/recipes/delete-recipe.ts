"use server"

import { hasPermission } from "@/helpers/helpers"
import { verifySession } from "@/lib/auth/verify-session"
import prisma from "@/lib/db/db"
import { revalidatePath } from "next/cache"

export async function deleteRecipe({ id }: { id: string }) {
  const session = await verifySession()
  const user = session?.user

  if (!user) {
    return { error: "No autorizado." }
  }

  if (!hasPermission(session.user, "delete:recipes")) {
    return { error: "No autorizado." }
  }

  try {
    const recipe = await prisma.recipe.delete({
      where: { id },
    })

    revalidatePath("/recipes")

    return { success: recipe }
  } catch (error) {
    console.log(error)
    return { error: "Hubo un error al eliminar la receta." }
  }
}

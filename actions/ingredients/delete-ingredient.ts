"use server"

import { hasPermission } from "@/helpers/helpers"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/db/db"
import { revalidatePath } from "next/cache"

export async function deleteIngredient({ id }: { id: string }) {
  const session = await auth()
  const user = session?.user

  if (!user) {
    return { error: "No autorizado." }
  }

  if (!hasPermission(session.user, "delete:ingredients")) {
    return { error: "No autorizado." }
  }

  try {
    const ingredient = await prisma.ingredient.delete({
      where: { id },
    })

    revalidatePath("/ingredients")

    return { success: ingredient }
  } catch (error) {
    console.error(error)
    return { error: "Hubo un error al eliminar el ingrediente." }
  }
}

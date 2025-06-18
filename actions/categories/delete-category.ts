"use server"

import { hasPermission } from "@/helpers/helpers"
import { verifySession } from "@/lib/auth/verify-session"
import prisma from "@/lib/db/db"
import { revalidatePath } from "next/cache"

export async function deleteCategory({ id }: { id: string }) {
  const session = await verifySession()
  const user = session?.user

  if (!user) {
    return { error: "No autorizado." }
  }

  if (!hasPermission(session.user, "delete:categories")) {
    return { error: "No autorizado." }
  }

  try {
    const category = await prisma.category.delete({
      where: { id },
    })

    revalidatePath("/categories")

    return { success: category }
  } catch (error) {
    console.error("Error deleting category:", error)
    return { error: "Hubo un error al eliminar la categoría." }
  }
}

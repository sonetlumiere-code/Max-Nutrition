"use server"

import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/db/db"
import { revalidatePath } from "next/cache"

export async function deleteCategory({ id }: { id: string }) {
  const session = await auth()

  if (session?.user.role !== "ADMIN") {
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

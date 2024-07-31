"use server"

import prisma from "@/lib/db/db"
import { revalidatePath } from "next/cache"

export async function deleteCategory({ id }: { id: string }) {
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

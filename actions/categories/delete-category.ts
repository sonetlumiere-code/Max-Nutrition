"use server"

import prisma from "@/lib/db/db"

export async function deleteCategory({ id }: { id: string }) {
  try {
    await prisma.category.update({
      where: { id },
      data: {
        products: {
          set: [],
        },
        promotions: {
          set: [],
        },
      },
    })

    const category = await prisma.category.delete({
      where: { id },
    })

    return { success: category }
  } catch (error) {
    console.error("Error deleting category:", error)
    return { error: "Hubo un error al eliminar la categoría." }
  }
}

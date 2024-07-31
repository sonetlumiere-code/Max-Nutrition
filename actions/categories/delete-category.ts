"use server"

import prisma from "@/lib/db/db"

export async function deleteCategory(id: string) {
  try {
    // Disconnect related products and promotions
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

    // Delete the category
    await prisma.category.delete({
      where: { id },
    })

    return { success: "Categoría eliminada con éxito." }
  } catch (error) {
    console.error("Error deleting category:", error)
    return { error: "Hubo un error al eliminar la categoría." }
  }
}

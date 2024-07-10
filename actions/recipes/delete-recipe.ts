"use server"

import prisma from "@/lib/db/db"
import { revalidatePath } from "next/cache"

export async function deleteRecipe({ id }: { id: string }) {
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

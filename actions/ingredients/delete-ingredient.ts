"use server"

import prisma from "@/lib/db/db"
import { revalidatePath } from "next/cache"

export async function deleteIngredient({ id }: { id: string }) {
  try {
    const ingredient = await prisma.ingredient.delete({
      where: { id },
    })

    revalidatePath("/ingredients")

    return { success: ingredient }
  } catch (error) {
    return { error: "Hubo un error al eliminar el ingrediente." }
  }
}

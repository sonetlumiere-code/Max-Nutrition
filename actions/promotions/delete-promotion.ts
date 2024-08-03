"use server"

import prisma from "@/lib/db/db"
import { revalidatePath } from "next/cache"

export async function deletePromotion({ id }: { id: string }) {
  try {
    const promotion = await prisma.promotion.delete({
      where: { id },
    })

    revalidatePath("/promotions")

    return { success: promotion }
  } catch (error) {
    console.log(error)
    return { error: "Hubo un error al eliminar la promoción." }
  }
}

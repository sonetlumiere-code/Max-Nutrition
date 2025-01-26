"use server"

import { hasPermission } from "@/helpers/helpers"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/db/db"
import { revalidatePath } from "next/cache"

export async function deletePromotion({ id }: { id: string }) {
  const session = await auth()
  const user = session?.user

  if (!user) {
    return { error: "No autorizado." }
  }

  if (!hasPermission(session.user, "delete:promotions")) {
    return { error: "No autorizado." }
  }

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

"use server"

import { hasPermission } from "@/helpers/helpers"
import { verifySession } from "@/lib/auth/verify-session"
import prisma from "@/lib/db/db"
import { revalidatePath } from "next/cache"

export async function deleteShop({ id }: { id: string }) {
  const session = await verifySession()
  const user = session?.user

  if (!user) {
    return { error: "No autorizado." }
  }

  if (!hasPermission(session.user, "delete:shops")) {
    return { error: "No autorizado." }
  }

  try {
    const shop = await prisma.shop.delete({
      where: { id },
    })

    revalidatePath("/shops")

    return { success: shop }
  } catch (error) {
    console.log("Error deleting shop:", error)
    return { error: "Hubo un error al eliminar la tienda." }
  }
}

"use server"

import { hasPermission } from "@/helpers/helpers"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/db/db"
import { revalidatePath } from "next/cache"

export async function deleteShopBranch({ id }: { id: string }) {
  const session = await auth()
  const user = session?.user

  if (!user) {
    return { error: "No autorizado." }
  }

  if (!hasPermission(session.user, "delete:shopBranches")) {
    return { error: "No autorizado." }
  }

  try {
    const shopBranch = await prisma.shopBranch.delete({
      where: { id },
    })

    revalidatePath("/shop-branches")

    return { success: shopBranch }
  } catch (error) {
    console.log("Error deleting shop branch:", error)
    return { error: "Hubo un error al eliminar la sucursal." }
  }
}

"use server"

import { hasPermission } from "@/helpers/helpers"
import { verifySession } from "@/lib/auth/verify-session"
import prisma from "@/lib/db/db"
import { revalidatePath } from "next/cache"

export async function deleteRole({ id }: { id: string }) {
  const session = await verifySession()
  const user = session?.user

  if (!user) {
    return { error: "No autorizado." }
  }

  if (!hasPermission(session.user, "delete:roles")) {
    return { error: "No autorizado." }
  }

  try {
    const role = await prisma.role.delete({
      where: { id },
    })

    revalidatePath("/roles")

    return { success: role }
  } catch (error) {
    console.error("Error deleting role:", error)
    return { error: "Hubo un error al eliminar el rol." }
  }
}

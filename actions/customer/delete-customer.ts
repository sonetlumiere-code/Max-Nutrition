"use server"

import { hasPermission } from "@/helpers/helpers"
import { verifySession } from "@/lib/auth/verify-session"
import prisma from "@/lib/db/db"
import { revalidatePath } from "next/cache"

export async function deleteCustomer({ id }: { id: string }) {
  const session = await verifySession()
  const user = session?.user

  if (!user) {
    return { error: "No autorizado." }
  }

  if (!hasPermission(session.user, "delete:customers")) {
    return { error: "No autorizado." }
  }

  try {
    const customer = await prisma.customer.delete({
      where: { id },
    })

    revalidatePath("/customers")

    return { success: customer }
  } catch (error) {
    console.log(error)
    return { error: "Hubo un error al eliminar el cliente." }
  }
}

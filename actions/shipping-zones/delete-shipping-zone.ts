"use server"

import { hasPermission } from "@/helpers/helpers"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/db/db"
import { revalidatePath } from "next/cache"

export async function deleteShippingZone({ id }: { id: string }) {
  const session = await auth()
  const user = session?.user

  if (!user) {
    return { error: "No autorizado." }
  }

  if (!hasPermission(session.user, "delete:shippingZones")) {
    return { error: "No autorizado." }
  }

  try {
    const shippingZone = await prisma.shippingZone.delete({
      where: { id },
    })

    revalidatePath("/shippings")

    return { success: shippingZone }
  } catch (error) {
    console.log(error)
    return { error: "Hubo un error al eliminar la zona de envío." }
  }
}

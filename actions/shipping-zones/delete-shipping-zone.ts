"use server"

import prisma from "@/lib/db/db"
import { revalidatePath } from "next/cache"

export async function deleteShippingZone({ id }: { id: string }) {
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

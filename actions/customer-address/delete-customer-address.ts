"use server"

import prisma from "@/lib/db/db"
import { revalidatePath } from "next/cache"

export async function deleteCustomerAddress({ id }: { id: string }) {
  try {
    const ingredient = await prisma.customerAddress.delete({
      where: { id },
    })

    revalidatePath("/customer-info")

    return { success: ingredient }
  } catch (error) {
    console.error(error)
    return { error: "Hubo un error al eliminar la dirección." }
  }
}

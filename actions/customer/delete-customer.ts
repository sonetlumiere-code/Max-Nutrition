"use server"

import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/db/db"
import { revalidatePath } from "next/cache"

export async function deleteCustomer({ id }: { id: string }) {
  const session = await auth()

  if (session?.user.role !== "ADMIN") {
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

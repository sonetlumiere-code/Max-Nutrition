"use server"

import { getCustomer } from "@/data/customer"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/db/db"
import { revalidatePath } from "next/cache"

export async function deleteCustomerAddress({ id }: { id: string }) {
  const session = await auth()

  const customer = await getCustomer({
    where: {
      userId: session?.user.id,
    },
  })

  if (!customer) {
    return { error: "Cliente no encontrado." }
  }

  try {
    const address = await prisma.customerAddress.delete({
      where: { id, customerId: customer.id },
    })

    revalidatePath("/customer-info")

    return { success: address }
  } catch (error) {
    console.error("Error deleting customer address:", error)
    return { error: "Hubo un error al eliminar la dirección." }
  }
}

"use server"

import { verifySession } from "@/lib/auth/verify-session"
import prisma from "@/lib/db/db"
import { OrderStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"

export async function cancelCustomerOrder({ orderId }: { orderId: string }) {
  const session = await verifySession()
  const user = session?.user

  if (!user) {
    return { error: "No autorizado." }
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true },
    })

    if (!order || order.customer?.userId !== user.id) {
      return { error: "Pedido no encontrado." }
    }

    if (order.status !== OrderStatus.PENDING) {
      return { error: "Solo se pueden cancelar pedidos pendientes." }
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.CANCELLED },
    })

    revalidatePath("/customer-orders-history")
    revalidatePath("/orders")

    return { success: "El pedido fue cancelado." }
  } catch (error) {
    console.error("Error cancelling order:", error)
    return { error: "Hubo un error al cancelar el pedido." }
  }
}

"use server"

import { verifySession } from "@/lib/auth/verify-session"
import prisma from "@/lib/db/db"
import { PopulatedProduct } from "@/types/types"
import { ShopCategory } from "@prisma/client"

export type RepeatableItem = {
  product: PopulatedProduct
  quantity: number
  withSalt: boolean
}

/**
 * Devuelve los ítems de un pedido anterior listos para volver al carrito.
 *
 * Los productos se releen de la base en vez de reusar los del pedido: desde
 * entonces pueden haber quedado ocultos, sin stock o eliminados, y los precios
 * pueden haber cambiado.
 */
export async function getOrderItemsToRepeat({ orderId }: { orderId: string }) {
  const session = await verifySession()
  const user = session?.user

  if (!user) {
    return { error: "No autorizado." }
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: { select: { userId: true } },
        shop: { select: { shopCategory: true } },
        items: {
          include: { product: { select: { name: true } } },
        },
      },
    })

    if (!order || order.customer?.userId !== user.id) {
      return { error: "Pedido no encontrado." }
    }

    const products = (await prisma.product.findMany({
      where: {
        id: { in: order.items.map((item) => item.productId) },
        show: true,
        stock: true,
      },
      include: { categories: true },
    })) as PopulatedProduct[]

    const availableById = new Map(
      products.map((product) => [product.id, product])
    )

    const items: RepeatableItem[] = []
    const unavailable: string[] = []

    order.items.forEach((item) => {
      const product = availableById.get(item.productId)

      if (product) {
        items.push({
          product,
          quantity: item.quantity,
          withSalt: item.withSalt,
        })
      } else {
        unavailable.push(item.product?.name ?? "Producto no disponible")
      }
    })

    return {
      success: {
        items,
        unavailable,
        shopCategory: order.shop?.shopCategory as ShopCategory | undefined,
      },
    }
  } catch (error) {
    console.error("Error repeating order:", error)
    return { error: "Hubo un error al repetir el pedido." }
  }
}

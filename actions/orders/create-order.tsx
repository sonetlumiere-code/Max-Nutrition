"use server"

import { getProductsByIds } from "@/data/products"
import prisma from "@/lib/db/db"
import { orderSchema } from "@/lib/validations/order-validation"
import { revalidatePath } from "next/cache"
import { z } from "zod"

type OrderSchema = z.infer<typeof orderSchema>

export async function createOrder(values: OrderSchema) {
  const validatedFields = orderSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campos inválidos." }
  }

  const {
    customerId,
    customerAddressId,
    shippingMethod,
    paymentMethod,
    items,
  } = validatedFields.data
  const productIds = items.map((item) => item.productId)
  const uniqueProductIds = Array.from(new Set(productIds))

  try {
    const products = await getProductsByIds(uniqueProductIds)

    if (!products || products.length !== uniqueProductIds.length) {
      return { error: "Invalid product id." }
    }

    const total = items.reduce((acc, item) => {
      const product = products.find((p) => p.id === item.productId)
      return acc + (product ? product.price * item.quantity : 0)
    }, 0)

    const customerAddress = await prisma.customerAddress.findUnique({
      where: {
        id: customerAddressId,
      },
    })

    if (!customerAddress) {
      return { error: "Invalid customer address id." }
    }

    //TO DO get customer address shipping zone cost
    const shippingCost = 0

    const order = await prisma.order.create({
      data: {
        customerId,
        customerAddressId,
        shippingMethod,
        shippingCost,
        paymentMethod,
        taxCost: 0,
        total,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            withSalt: item.variation.withSalt,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    revalidatePath("/shop")
    revalidatePath("/orders")

    return { success: order }
  } catch (error) {
    console.error("Error creating order:", error)
    return { error: "Hubo un error al crear la orden." }
  }
}

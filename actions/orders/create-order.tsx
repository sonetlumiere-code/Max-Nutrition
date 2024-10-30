"use server"

import { getProductsByIds } from "@/data/products"
import prisma from "@/lib/db/db"
import { orderSchema } from "@/lib/validations/order-validation"
import { ShippingMethod } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { checkPromotion } from "../promotions/check-promotion"
import { PopulatedProduct } from "@/types/types"

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

    const populatedItems = items
      .map((item) => {
        const product = products.find((p) => p.id === item.productId)
        return product ? { product, quantity: item.quantity } : null
      })
      .filter(Boolean) as { product: PopulatedProduct; quantity: number }[]

    const subtotal = populatedItems.reduce((acc, item) => {
      return acc + item.product.price * item.quantity
    }, 0)

    const { appliedPromotion, finalPrice } = await checkPromotion({
      items: populatedItems,
      subtotal,
    })

    if (appliedPromotion) {
      const allowedShippingMethods =
        appliedPromotion.allowedShippingMethods || []
      const allowedPaymentMethods = appliedPromotion.allowedPaymentMethods || []

      if (!allowedShippingMethods.includes(shippingMethod)) {
        return {
          error: "Selected shipping method is not eligible for the promotion.",
        }
      }

      if (!allowedPaymentMethods.includes(paymentMethod)) {
        return {
          error: "Selected payment method is not eligible for the promotion.",
        }
      }
    }

    const promotionName = appliedPromotion?.name ?? null

    let shippingCost = 0

    if (shippingMethod === ShippingMethod.Delivery) {
      const customerAddress = await prisma.customerAddress.findUnique({
        where: { id: customerAddressId },
      })

      if (!customerAddress) {
        return { error: "Invalid customer address id." }
      }

      shippingCost = 0 // Replace with actual calculation based on address zone
    }

    const total = finalPrice + shippingCost

    const order = await prisma.order.create({
      data: {
        customerId,
        customerAddressId: customerAddressId || null,
        shippingMethod,
        shippingCost,
        paymentMethod,
        taxCost: 0,
        subtotal,
        total,
        appliedPromotionName: promotionName,
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

    revalidatePath("/customer-orders-history")

    return { success: order }
  } catch (error) {
    console.error("Error creating order:", error)
    return { error: "Hubo un error al crear la orden." }
  }
}

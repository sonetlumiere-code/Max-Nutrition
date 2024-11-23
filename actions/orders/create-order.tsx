"use server"

import { getCustomer } from "@/data/customer"
import { getProducts } from "@/data/products"
import { getShippingSettings } from "@/data/shipping-settings"
import { getShippingZone } from "@/data/shipping-zones"
import prisma from "@/lib/db/db"
import { sendOrderDetailsEmail } from "@/lib/mail/mail"
import { orderSchema } from "@/lib/validations/order-validation"
import { PopulatedOrder, PopulatedProduct } from "@/types/types"
import { ShippingMethod } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { checkPromotion } from "../promotions/check-promotion"

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
    const [products, customer] = await Promise.all([
      getProducts({
        where: {
          id: {
            in: uniqueProductIds,
          },
          show: true,
        },
      }),
      getCustomer({
        where: {
          id: customerId,
        },
        include: {
          user: true,
          address: true,
        },
      }),
    ])

    if (!products || products.length !== uniqueProductIds.length) {
      return { error: "Invalid product id." }
    }

    if (!customer) {
      return { error: "Invalid customer id." }
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

    let shippingCost = 0

    if (shippingMethod === ShippingMethod.Delivery) {
      const shippingSettings = await getShippingSettings()
      const totalProductsQuantity = items.reduce(
        (acc, curr) => acc + curr.quantity,
        0
      )

      if (
        shippingSettings &&
        shippingSettings.minProductsQuantityForDelivery > totalProductsQuantity
      ) {
        return {
          error: `Products quantity must be greater or equal to ${shippingSettings.minProductsQuantityForDelivery} to allow delivery.`,
        }
      }

      const customerAddress = customer.address?.find(
        (address) => address.id === customerAddressId
      )

      if (!customerAddress) {
        return { error: "Invalid customer address id." }
      }

      const shippingZone = await getShippingZone({
        where: {
          locality: customerAddress.locality,
          isActive: true,
        },
      })

      if (!shippingZone) {
        return {
          error: `Shipping is not available for the locality: ${customerAddress.locality}.`,
        }
      }

      shippingCost = shippingZone?.cost || 0
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
        appliedPromotionName: appliedPromotion?.name ?? null,
        appliedPromotionDiscountType: appliedPromotion?.discountType ?? null,
        appliedPromotionDiscount: appliedPromotion?.discount ?? null,
        subtotal,
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
        address: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    sendOrderDetailsEmail({
      email: customer.user?.email || "",
      order: order as PopulatedOrder,
      orderLink: "customer-orders-history",
    })

    revalidatePath("/customer-orders-history")

    return { success: order }
  } catch (error) {
    console.error("Error creating order:", error)
    return { error: "Hubo un error al crear la orden." }
  }
}

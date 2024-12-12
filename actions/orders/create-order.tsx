"use server"

import { getCustomer } from "@/data/customer"
import { getProducts } from "@/data/products"
import { getShippingSettings } from "@/data/shipping-settings"
import { getShippingZone } from "@/data/shipping-zones"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/db/db"
import { sendOrderDetailsEmail } from "@/lib/mail/mail"
import { orderSchema } from "@/lib/validations/order-validation"
import { PopulatedOrder, PopulatedProduct } from "@/types/types"
import { ShippingMethod } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { checkPromotion } from "../promotions/check-promotion"

const shippingSettingsId = process.env.SHIPPING_SETTINGS_ID

type OrderSchema = z.infer<typeof orderSchema>

export async function createOrder(values: OrderSchema) {
  const session = await auth()

  const validatedFields = orderSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campos inválidos." }
  }

  const { customerAddressId, shippingMethod, paymentMethod, items } =
    validatedFields.data
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
        include: {
          categories: true,
        },
      }),
      getCustomer({
        where: {
          userId: session?.user.id,
        },
        include: {
          user: true,
          address: true,
        },
      }),
    ])

    if (!products || products.length !== uniqueProductIds.length) {
      return { error: "ID de producto inválido." }
    }

    if (!customer) {
      return { error: "ID de cliente inválido." }
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
          error:
            "El método de envío seleccionado no es válido para la promoción.",
        }
      }

      if (!allowedPaymentMethods.includes(paymentMethod)) {
        return {
          error:
            "El método de pago seleccionado no es válido para la promoción.",
        }
      }
    }

    let shippingCost = 0

    if (shippingMethod === ShippingMethod.DELIVERY) {
      const shippingSettings = await getShippingSettings({
        where: { id: shippingSettingsId },
      })

      const totalProductsQuantity = items.reduce(
        (acc, curr) => acc + curr.quantity,
        0
      )

      if (
        shippingSettings &&
        shippingSettings.minProductsQuantityForDelivery > totalProductsQuantity
      ) {
        return {
          error: `La cantidad de productos debe ser mayor o igual a ${shippingSettings.minProductsQuantityForDelivery} para permitir la entrega.`,
        }
      }

      const customerAddress = customer.address?.find(
        (address) => address.id === customerAddressId
      )

      if (!customerAddress) {
        return { error: "ID de dirección de cliente inválido." }
      }

      const shippingZone = await getShippingZone({
        where: {
          locality: customerAddress.locality,
          isActive: true,
        },
      })

      if (!shippingZone) {
        return {
          error: `No hay envíos disponibles para la localidad: ${customerAddress.locality}.`,
        }
      }

      shippingCost = shippingZone?.cost || 0
    }

    const total = finalPrice + shippingCost

    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
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
        customer: {
          include: {
            user: {
              select: {
                email: true,
                name: true,
              },
            },
          },
        },
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

    return { success: "La orden se creó exitosamente.", order }
  } catch (error) {
    console.error("Error creating order:", error)
    return { error: "Hubo un error al crear la orden." }
  }
}

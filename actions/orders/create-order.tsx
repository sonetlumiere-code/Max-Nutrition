"use server"

import { getCustomer } from "@/data/customer"
import { getProducts } from "@/data/products"
import { getShippingSettings } from "@/data/shipping-settings"
import { getShippingZone } from "@/data/shipping-zones"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/db/db"
import { sendOrderDetailsEmail } from "@/lib/mail/mail"
import { OrderSchema, orderSchema } from "@/lib/validations/order-validation"
import { PopulatedOrder, PopulatedProduct } from "@/types/types"
import { Role, ShippingMethod } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { checkPromotion } from "../promotions/check-promotion"

const shippingSettingsId = process.env.SHIPPING_SETTINGS_ID

export async function createOrder({
  values,
  sendEmail,
}: {
  values: OrderSchema
  sendEmail?: boolean
}) {
  const session = await auth()
  const userRole: Role | undefined = session?.user.role

  if (!session || !userRole) {
    return { error: "Usuario no autenticado o rol no válido." }
  }

  const validatedFields = orderSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campos inválidos." }
  }

  const {
    origin,
    customerId,
    customerAddressId,
    shippingMethod,
    paymentMethod,
    items,
  } = validatedFields.data

  if (origin === "DASHBOARD" && userRole !== "ADMIN") {
    return {
      error:
        "No autorizado para realizar esta acción desde el panel de administración.",
    }
  }

  if (origin === "DASHBOARD" && !customerId) {
    return {
      error:
        "El ID del cliente es obligatorio para crear pedidos desde el panel de administración.",
    }
  }

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
          userId: origin === "SHOP" ? session?.user.id : undefined,
          id: origin === "DASHBOARD" ? customerId : undefined,
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
      return { error: "Cliente no encontrado." }
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

    const { appliedPromotions, finalPrice } = await checkPromotion({
      items: populatedItems,
      subtotal,
    })

    let promotionsData = []

    for (const appliedPromotion of appliedPromotions) {
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

      promotionsData.push({
        promotionId: appliedPromotion.id,
        promotionName: appliedPromotion.name,
        promotionDiscountType: appliedPromotion.discountType,
        promotionDiscount: appliedPromotion.discount,
        appliedTimes: appliedPromotion.appliedTimes,
      })
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
          error: `La cantidad de productos debe ser mayor o igual a ${shippingSettings.minProductsQuantityForDelivery} para permitir la entrega a domicilio.`,
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
        subtotal,
        total,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            withSalt: item.variation.withSalt,
          })),
        },
        appliedPromotions: {
          create: promotionsData,
        },
      },
      include: {
        address: true,
        appliedPromotions: true,
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

    if (sendEmail) {
      sendOrderDetailsEmail({
        email: customer.user?.email || "",
        order: order as PopulatedOrder,
        orderLink: "customer-orders-history",
      })
    }

    revalidatePath("/customer-orders-history")

    return { success: "La orden se creó exitosamente.", order }
  } catch (error) {
    console.error("Error creating order:", error)
    return { error: "Hubo un error al crear la orden." }
  }
}

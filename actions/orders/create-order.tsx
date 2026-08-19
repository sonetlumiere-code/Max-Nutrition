"use server"

import { getCustomer } from "@/data/customer"
import { getProducts } from "@/data/products"
import { getShippingSettings } from "@/data/shipping-settings"
import { getShopSettings } from "@/data/shop-settings"
import { getShippingZone } from "@/data/shipping-zones"
import { verifySession } from "@/lib/auth/verify-session"
import prisma from "@/lib/db/db"
import { calculateSubtotal, calculateTotal } from "@/lib/orders/pricing"
import { sendOrderDetailsEmail } from "@/lib/mail/mail"
import { OrderSchema, orderSchema } from "@/lib/validations/order-validation"
import { PopulatedOrder, PopulatedProduct } from "@/types/types"
import { ShippingMethod } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { checkPromotion } from "../promotions/check-promotion"
import { getShopBranch } from "@/data/shop-branches"
import { hasPermission, isShopCurrentlyAvailable } from "@/helpers/helpers"
import { getShop } from "@/data/shops"

const shopSettingsId = process.env.SHOP_SETTINGS_ID

export async function createOrder({
  values,
  sendEmail,
}: {
  values: OrderSchema
  sendEmail?: boolean
}) {
  if (!shopSettingsId) {
    return { error: "Es necesario el ID de la configuración de tienda." }
  }

  const session = await verifySession()
  const user = session?.user

  if (!session || !user) {
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
    items: rawItems,
    shopCategory,
    shopBranchId,
  } = validatedFields.data

  // Consolida ítems repetidos (mismo producto y variante) para no violar la
  // restricción única de OrderItem.
  const items = Object.values(
    rawItems.reduce<Record<string, (typeof rawItems)[number]>>((acc, item) => {
      const key = `${item.productId}-${item.variation.withSalt}`
      if (acc[key]) {
        acc[key] = { ...acc[key], quantity: acc[key].quantity + item.quantity }
      } else {
        acc[key] = item
      }
      return acc
    }, {})
  )

  const shop = await getShop({
    where: { shopCategory, isActive: true },
    include: { operationalHours: true },
  })

  if (!shop) {
    return { error: "Tienda no encontrada." }
  }

  const isShopAvailable = isShopCurrentlyAvailable(shop.operationalHours)

  if (!isShopAvailable) {
    return { error: "Tienda no disponible. Horario no operacional." }
  }

  if (origin === "DASHBOARD" && !hasPermission(user, "create:orders")) {
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

  const uniqueProductIds = Array.from(
    new Set(items.map((item) => item.productId))
  )

  try {
    const [shopSettings, shippingSettings] = await Promise.all([
      getShopSettings({ where: { id: shopSettingsId } }),
      getShippingSettings({ where: { shopSettingsId } }),
    ])

    if (
      shopSettings &&
      !shopSettings.allowedPaymentMethods.includes(paymentMethod)
    ) {
      return { error: "El método de pago no está habilitado por la tienda." }
    }

    if (
      shippingSettings &&
      !shippingSettings.allowedShippingMethods.includes(shippingMethod)
    ) {
      return { error: "El método de envío no está habilitado por la tienda." }
    }

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
          addresses: true,
        },
      }),
    ])

    if (!products || products.length !== uniqueProductIds.length) {
      return { error: "ID de producto inválido." }
    }

    const outOfStockProduct = products.find((product) => !product.stock)

    if (outOfStockProduct) {
      return { error: `Producto sin stock: ${outOfStockProduct.name}.` }
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

    const foreignProduct = populatedItems.find(
      (item) =>
        !item.product.categories?.some(
          (category) => category.shopCategory === shopCategory
        )
    )

    if (foreignProduct) {
      return { error: "Hay productos que no pertenecen a esta tienda." }
    }

    const subtotal = calculateSubtotal(populatedItems)

    const { appliedPromotions, finalPrice } = await checkPromotion({
      items: populatedItems,
      shopCategory,
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
        discountAmount: appliedPromotion.discountAmount,
      })
    }

    let shippingCost = 0

    if (shippingMethod === ShippingMethod.TAKE_AWAY) {
      const branch = await getShopBranch({
        where: { id: shopBranchId, isActive: true },
      })

      if (!branch) {
        return { error: "ID de sucursal inválido." }
      }
    }

    if (shippingMethod === ShippingMethod.DELIVERY) {
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

      const customerAddress = customer.addresses?.find(
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

    const total = calculateTotal(finalPrice, shippingCost)

    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        // La dirección solo aplica a envíos a domicilio.
        customerAddressId:
          shippingMethod === ShippingMethod.DELIVERY
            ? customerAddressId
            : null,
        shippingMethod,
        shippingCost,
        paymentMethod,
        taxCost: 0,
        subtotal,
        total,
        shopBranchId: shippingMethod === "TAKE_AWAY" ? shopBranchId : null,
        shopId: shop.id,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            withSalt: item.variation.withSalt,
            unitPrice:
              products.find((p) => p.id === item.productId)?.price ?? null,
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
        orderLink: `/${shop.key}/customer-orders-history`,
      })
    }

    revalidatePath("/orders")

    return { success: "La orden se creó exitosamente.", order }
  } catch (error) {
    console.error("Error creating order:", error)
    return { error: "Hubo un error al crear la orden." }
  }
}

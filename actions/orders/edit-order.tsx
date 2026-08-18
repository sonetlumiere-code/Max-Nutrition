"use server"

import { getShippingZone } from "@/data/shipping-zones"
import { hasPermission } from "@/helpers/helpers"
import { verifySession } from "@/lib/auth/verify-session"
import prisma from "@/lib/db/db"
import {
  PartialOrderSchema,
  partialOrderSchema,
} from "@/lib/validations/order-validation"
import { OrderStatus, ShippingMethod } from "@prisma/client"
import { revalidatePath } from "next/cache"

export async function editOrder({
  id,
  values,
}: {
  id: string
  values: PartialOrderSchema
}) {
  const session = await verifySession()
  const user = session?.user

  if (!user) {
    return { error: "No autorizado." }
  }

  if (!hasPermission(session.user, "update:orders")) {
    return { error: "No autorizado." }
  }

  const validatedFields = partialOrderSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campos inválidos." }
  }

  const {
    customerAddressId,
    shippingMethod,
    paymentMethod,
    paymentStatus,
    status,
  } = validatedFields.data

  try {
    const existingOrder = await prisma.order.findUnique({
      where: { id },
    })

    if (!existingOrder) {
      return { error: "Pedido no encontrado." }
    }

    if (existingOrder.status === OrderStatus.CANCELLED) {
      return { error: "No se puede modificar un pedido cancelado." }
    }

    // Si cambia el método de envío o la dirección, el costo de envío y el
    // total se recalculan para que la orden quede consistente.
    const shippingChanged =
      shippingMethod !== undefined || customerAddressId !== undefined

    let shippingCost = existingOrder.shippingCost ?? 0

    if (shippingChanged) {
      const targetShippingMethod =
        shippingMethod ?? existingOrder.shippingMethod

      if (targetShippingMethod === ShippingMethod.DELIVERY) {
        const targetAddressId =
          customerAddressId ?? existingOrder.customerAddressId

        if (!targetAddressId) {
          return { error: "Debes seleccionar la dirección de envío." }
        }

        const customerAddress = await prisma.customerAddress.findUnique({
          where: { id: targetAddressId },
        })

        if (
          !customerAddress ||
          customerAddress.customerId !== existingOrder.customerId
        ) {
          return { error: "La dirección no pertenece al cliente del pedido." }
        }

        const shippingZone = await getShippingZone({
          where: { locality: customerAddress.locality, isActive: true },
        })

        if (!shippingZone) {
          return {
            error: `No hay envíos disponibles para la localidad: ${customerAddress.locality}.`,
          }
        }

        shippingCost = shippingZone.cost || 0
      } else {
        shippingCost = 0
      }
    }

    const total =
      existingOrder.total - (existingOrder.shippingCost ?? 0) + shippingCost

    const order = await prisma.order.update({
      where: { id },
      data: {
        customerAddressId,
        shippingMethod,
        paymentMethod,
        paymentStatus,
        status,
        shippingCost,
        total,
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
    revalidatePath("/orders")

    return { success: order }
  } catch (error) {
    console.error("Error updating order:", error)
    return { error: "Hubo un error al editar la orden." }
  }
}

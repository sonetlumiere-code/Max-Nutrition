"use server"

import { hasPermission } from "@/helpers/helpers"
import { verifySession } from "@/lib/auth/verify-session"
import prisma from "@/lib/db/db"
import {
  PartialOrderSchema,
  partialOrderSchema,
} from "@/lib/validations/order-validation"
import { ShippingMethod } from "@prisma/client"
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

  const { customerAddressId, shippingMethod, paymentMethod, status } =
    validatedFields.data

  try {
    if (shippingMethod === ShippingMethod.DELIVERY) {
      const customerAddress = await prisma.customerAddress.findUnique({
        where: {
          id: customerAddressId,
        },
      })

      if (!customerAddress) {
        return { error: "Invalid customer address id." }
      }
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        customerAddressId,
        shippingMethod,
        paymentMethod,
        status,
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

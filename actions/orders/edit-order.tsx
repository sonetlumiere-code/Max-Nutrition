"use server"

import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/db/db"
import { partialOrderSchema } from "@/lib/validations/order-validation"
import { ShippingMethod } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { z } from "zod"

type PartialOrderSchema = z.infer<typeof partialOrderSchema>

export async function editOrder({
  id,
  values,
}: {
  id: string
  values: PartialOrderSchema
}) {
  const session = await auth()

  if (session?.user.role !== "ADMIN") {
    return { error: "No autorizado." }
  }

  const validatedFields = partialOrderSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campos inválidos." }
  }

  const { customerAddressId, shippingMethod, paymentMethod, status } =
    validatedFields.data

  try {
    if (shippingMethod === ShippingMethod.Delivery) {
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

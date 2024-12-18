import { OrderStatus, PaymentMethod, ShippingMethod } from "@prisma/client"
import { z } from "zod"

const coreOrderSchema = z.object({
  // customerId: z.string(),
  customerAddressId: z.string().optional(),
  paymentMethod: z.nativeEnum(PaymentMethod),
  shippingMethod: z.nativeEnum(ShippingMethod),
  status: z.nativeEnum(OrderStatus).optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.coerce.number().min(1),
      variation: z.object({ withSalt: z.boolean() }),
    })
  ),
})

export const orderSchema = coreOrderSchema.refine(
  (data) => {
    if (data.shippingMethod === ShippingMethod.DELIVERY) {
      return (
        !!data.customerAddressId &&
        typeof data.customerAddressId === "string" &&
        data.customerAddressId.trim().length > 0
      )
    }
    return true
  },
  {
    message: "Debes seleccionar la dirección de envío para delivery.",
    path: ["customerAddressId"],
  }
)

export const partialOrderSchema = coreOrderSchema.partial()

export type OrderSchema = z.infer<typeof orderSchema>

import { PaymentMethod, ShippingMethod } from "@prisma/client"
import { z } from "zod"

export const orderSchema = z
  .object({
    customerId: z.string(),
    customerAddressId: z.string().optional(),
    paymentMethod: z.nativeEnum(PaymentMethod),
    shippingMethod: z.nativeEnum(ShippingMethod),
    items: z.array(
      z.object({
        productId: z.string(),
        quantity: z.coerce.number().min(1),
        variation: z.object({ withSalt: z.boolean() }),
      })
    ),
  })
  .refine(
    (data) => {
      if (data.shippingMethod === ShippingMethod.Delivery) {
        return (
          !!data.customerAddressId &&
          typeof data.customerAddressId === "string" &&
          data.customerAddressId.trim().length > 0
        )
      }
      return true
    },
    {
      message: "Debes seleccionar la dirección de envío para Delivery.",
      path: ["customerAddressId"],
    }
  )

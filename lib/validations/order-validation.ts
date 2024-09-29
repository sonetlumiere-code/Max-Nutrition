import { PaymentMethod, ShippingMethod } from "@prisma/client"
import { z } from "zod"

export const orderSchema = z.object({
  customerId: z.string(),
  customerAddressId: z
    .string()
    .min(1, { message: "Debes seleccionar la dirección de envío." }),
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

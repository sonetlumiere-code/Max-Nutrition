import { ShippingMethod } from "@prisma/client"
import { z } from "zod"

export const shippingSettingsSchema = z.object({
  allowedShippingMethods: z
    .array(z.nativeEnum(ShippingMethod))
    .nonempty({ message: "Debes seleccionar al menos un método de envío." }),
  minProductsQuantityForDelivery: z.coerce
    .number()
    .min(0, { message: "El valor debe ser numerico, mínimo 0." }),
})

import { z } from "zod"

export const shippingSettingsSchema = z.object({
  takeAway: z.boolean(),
  delivery: z.boolean(),
  minProductsQuantityForDelivery: z.coerce
    .number()
    .min(0, { message: "El valor debe ser numerico, mínimo 0." }),
})

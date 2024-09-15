import { z } from "zod"

export const shippingSettingsSchema = z.object({
  takeAway: z.boolean(),
  shipping: z.boolean(),
  minProductsQuantityForShipping: z.coerce
    .number()
    .min(0, { message: "El valor debe ser numerico, mínimo 0." }),
})

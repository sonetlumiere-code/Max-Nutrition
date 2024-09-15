import { z } from "zod"

export const shopSettingsSchema = z.object({
  operationalHours: z.string(),
  takeAway: z.boolean(),
  shipping: z.boolean(),
  minProductsQuantityForShipping: z.coerce
    .number()
    .min(0, { message: "El valor debe ser numerico, mínimo 0." }),
})

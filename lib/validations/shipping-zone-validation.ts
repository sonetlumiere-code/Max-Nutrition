import { z } from "zod"

export const shippingZoneSchema = z.object({
  zone: z.string().min(1, { message: "Ingresa la zona de envío." }),
  cost: z.coerce.number(),
})

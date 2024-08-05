import { z } from "zod"

export const shippingZoneSchema = z.object({
  neighborhood: z.string().min(1, { message: "Ingresa la zona de envío." }),
  cost: z.coerce.number().min(0.1, { message: "Ingresa el costo de envío." }),
})

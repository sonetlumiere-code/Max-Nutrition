import { z } from "zod"

export const shippingZoneSchema = z.object({
  province: z.string().min(1, { message: "Selecciona la provincia." }),
  municipality: z.string().min(1, { message: "Selecciona la municipalidad." }),
  locality: z.string().min(1, { message: "Selecciona la localidad" }),
  cost: z.coerce.number(),
  isActive: z.boolean(),
})

export type ShippingZoneSchema = z.infer<typeof shippingZoneSchema>

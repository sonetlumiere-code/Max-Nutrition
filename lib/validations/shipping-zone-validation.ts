import { z } from "zod"
import { operationalHoursSchema } from "./operational-hours-validation"

export const shippingZoneSchema = z.object({
  province: z.string().min(1, { message: "Selecciona la provincia." }),
  municipality: z.string().min(1, { message: "Selecciona la municipalidad." }),
  locality: z.string().min(1, { message: "Selecciona la localidad" }),
  cost: z.coerce.number(),
  isActive: z.boolean(),
  operationalHours: z.array(operationalHoursSchema).optional(),
})

export type ShippingZoneSchema = z.infer<typeof shippingZoneSchema>

import { z } from "zod"
import { customerAddressSchema } from "./customer-address-validation"

export const customerSchema = z.object({
  name: z.string().min(1, { message: "Debes ingresar tu nombre y apellido." }),
  birthdate: z.date().optional(),
  phone: z.coerce
    .number()
    .int()
    .gte(1000000000, {
      message: "(Código de área) + Número de teléfono.",
    })
    .lte(9999999999, {
      message: "(Código de área) + Número de teléfono",
    })
    .optional(),
  addresses: z.array(customerAddressSchema).optional(),
})

export const customerByUserSchema = customerSchema.extend({
  userId: z.string().min(1, { message: "Debes ingresar un usuario." }),
})

export type CustomerSchema = z.infer<typeof customerSchema>

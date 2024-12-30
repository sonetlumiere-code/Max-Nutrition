import { z } from "zod"
import { customerAddressSchema } from "./customer-address-validation"

export const customerSchema = z.object({
  userId: z.string().optional(),
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
  address: z.array(customerAddressSchema).optional(),
})

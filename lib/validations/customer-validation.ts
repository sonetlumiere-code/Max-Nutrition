import { z } from "zod"
import { customerAddressSchema } from "./customer-address-validation"

export const customerSchema = z.object({
  userId: z.string(),
  name: z.string().min(1, { message: "Debes ingresar tu nombre y apellido." }),
  birthdate: z.date().optional(),
  address: z.array(customerAddressSchema).optional(),
})

import { z } from "zod"
import { customerAddressSchema } from "./customer-address-validation"

export const customerSchema = z.object({
  userId: z.string(),
  birthdate: z.string().optional(),
  address: z.array(customerAddressSchema).optional(),
})

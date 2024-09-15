import { z } from "zod"

export const customerAddressSchema = z.object({
  address: z.string(),
  city: z.string(),
  postCode: z.string(),
})

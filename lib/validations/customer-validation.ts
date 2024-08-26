import { z } from "zod"

export const customerSchema = z.object({
  userId: z.string(),
  birthdate: z.string().optional(),
  address: z
    .object({
      address: z.string(),
      city: z.string(),
      postCode: z.string(),
    })
    .optional(),
})

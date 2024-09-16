import { z } from "zod"

export const customerAddressSchema = z.object({
  address: z.string().min(1, { message: "Ingresa tu dirección." }),
  city: z.string().min(1, { message: "Ingresa tu ciudad." }),
  postCode: z.string().min(1, { message: "Ingresa tu código postal." }),
})

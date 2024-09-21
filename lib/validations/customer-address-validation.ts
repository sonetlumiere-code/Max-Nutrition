import { AddressLabel } from "@prisma/client"
import { z } from "zod"

export const customerAddressSchema = z
  .object({
    id: z.string().optional(),
    address: z.string().min(1, { message: "Ingresa tu dirección." }),
    city: z.string().min(1, { message: "Ingresa tu ciudad." }),
    postCode: z.string().min(1, { message: "Ingresa tu código postal." }),
    label: z.nativeEnum(AddressLabel),
    labelString: z.string(),
  })
  .refine(
    (data) =>
      data.label !== AddressLabel.Other ||
      (data.label === AddressLabel.Other &&
        data.labelString?.trim().length > 0),
    {
      message: "Debes ingresar una etiqueta personalizada.",
      path: ["labelString"],
    }
  )

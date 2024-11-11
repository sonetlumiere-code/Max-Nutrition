import { AddressLabel } from "@prisma/client"
import { z } from "zod"

export const customerAddressSchema = z
  .object({
    id: z.string().optional(),
    label: z.nativeEnum(AddressLabel),
    labelString: z.string(),
    province: z.string().min(1, { message: "Ingresa tu provincia." }),
    municipality: z.string().min(1, { message: "Ingresa tu municipio." }),
    locality: z.string().min(1, { message: "Ingresa tu localidad." }),
    addressStreet: z.string().min(1, { message: "Ingresa tu calle." }),
    addressNumber: z
      .number()
      .min(1, { message: "Ingresa el número de calle." }),
    addressFloor: z.number().optional().nullable(),
    addressApartament: z.string().optional().nullable(),
    postCode: z.string().min(1, { message: "Ingresa tu código postal." }),
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

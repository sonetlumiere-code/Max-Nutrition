import { CustomerAddressLabel } from "@prisma/client"
import { z } from "zod"
import { addressGeoRefSchema } from "./address-georef-validation"

export const customerAddressSchema = z
  .object({
    id: z.string().optional(),
    label: z.nativeEnum(CustomerAddressLabel),
    labelString: z.string(),
    province: z.string().min(1, { message: "Ingresa tu provincia." }),
    municipality: z.string().min(1, { message: "Ingresa tu municipio." }),
    locality: z.string().min(1, { message: "Ingresa tu localidad." }),
    addressGeoRef: addressGeoRefSchema,
    addressNumber: z.coerce.number().positive({
      message: "Ingresa un número de calle válido.",
    }),
    addressFloor: z.coerce.number().optional(),
    addressApartment: z
      .string()
      .optional()
      .transform((value) => value?.toUpperCase() || ""),
    postCode: z.string().min(1, { message: "Ingresa tu código postal." }),
    notes: z.string().optional(),
  })
  .refine(
    (data) =>
      data.label !== CustomerAddressLabel.OTHER ||
      (data.label === CustomerAddressLabel.OTHER &&
        data.labelString?.trim().length > 0),
    {
      message: "Debes ingresar una etiqueta personalizada.",
      path: ["labelString"],
    }
  )

export type CustomerAddressSchema = z.infer<typeof customerAddressSchema>

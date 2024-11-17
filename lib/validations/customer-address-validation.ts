import { AddressLabel } from "@prisma/client"
import { z } from "zod"

const addressGeoRefSchema = z.object(
  {
    altura: z.object({
      unidad: z.string().nullable(),
      valor: z.coerce.number(),
    }),
    calle: z.object({
      categoria: z.enum(["CALLE", "AV"]).optional(),
      id: z.string(),
      nombre: z.string(),
    }),
    departamento: z.object({
      id: z.string(),
      nombre: z.string(),
    }),
    nomenclatura: z.string(),
    provincia: z.object({
      id: z.string(),
      nombre: z.string(),
    }),
  },
  { message: "Ingresa tu calle." }
)

export const customerAddressSchema = z
  .object({
    id: z.string().optional(),
    label: z.nativeEnum(AddressLabel),
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

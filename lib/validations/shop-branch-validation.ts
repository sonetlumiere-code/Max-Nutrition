import { z } from "zod"
import { operationalHoursSchema } from "./operational-hours-validation"
import { BranchType } from "@prisma/client"
import { addressGeoRefSchema } from "./address-georef-validation"

export const shopBranchSchema = z.object({
  id: z.string().optional(), // Opcional durante la creación
  label: z
    .string()
    .min(1, { message: "El nombre de la sucursal es obligatorio." }),
  branchType: z.nativeEnum(BranchType, {
    message: "El tipo de sucursal es obligatorio.",
  }),
  province: z.string().min(1, { message: "La provincia es obligatoria." }),
  municipality: z.string().min(1, { message: "El municipio es obligatorio." }),
  locality: z.string().min(1, { message: "La localidad es obligatoria." }),
  addressGeoRef: addressGeoRefSchema,
  addressNumber: z.coerce.number().min(1, {
    message: "El número de dirección debe ser un número entero positivo.",
  }),
  addressFloor: z.coerce.number().optional(),
  addressApartment: z
    .string()
    .optional()
    .transform((value) => value?.toUpperCase() || ""),
  postCode: z.string().optional(),
  phoneNumber: z.string().optional(),
  email: z
    .string()
    .email({ message: "El correo electrónico no es válido." })
    .optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  managerName: z.string().optional(),
  image: z.string().optional(),
  description: z.string().optional(),
  timezone: z.string().optional(),
  isActive: z.boolean().optional().default(true),
  operationalHours: z.array(operationalHoursSchema).optional(),
})

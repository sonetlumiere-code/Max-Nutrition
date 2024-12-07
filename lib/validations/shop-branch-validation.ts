import { z } from "zod"
import { operationalHoursSchema } from "./operational-hours-validation"

export const shopBranchSchema = z.object({
  id: z.string().optional(), // Opcional durante la creación
  label: z
    .string()
    .min(1, { message: "El nombre de la sucursal es obligatorio." }),
  branchType: z.enum(["RETAIL", "WAREHOUSE", "CORPORATE", "SERVICE_CENTER"], {
    message: "El tipo de sucursal es obligatorio.",
  }),
  province: z.string().min(1, { message: "La provincia es obligatoria." }),
  municipality: z.string().min(1, { message: "El municipio es obligatorio." }),
  locality: z.string().min(1, { message: "La localidad es obligatoria." }),
  addressStreet: z.string().min(1, { message: "La calle es obligatoria." }),
  addressNumber: z.number().int().nonnegative({
    message: "El número de dirección debe ser un número entero positivo.",
  }),
  phoneNumber: z.string().optional().nullable(),
  email: z
    .string()
    .email({ message: "El correo electrónico no es válido." })
    .optional()
    .nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  managerName: z.string().optional().nullable(),
  image: z
    .string()
    .url({ message: "La URL de la imagen no es válida." })
    .optional()
    .nullable(),
  description: z.string().optional().nullable(),
  timezone: z.string().optional().nullable(),
  isActive: z.boolean().optional().default(true),
  operationalHours: z.array(operationalHoursSchema).optional(),
})

import { z } from "zod"

export const addressGeoRefSchema = z.object(
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

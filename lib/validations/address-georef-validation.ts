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
      // El mismo mensaje que el del objeto entero: si falta la calle, el error
      // queda en esta ruta anidada y es lo único que el formulario puede
      // mostrar. Sin esto decía "Required".
      nombre: z
        .string({ required_error: "Ingresa tu calle." })
        .min(1, { message: "Ingresa tu calle." }),
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

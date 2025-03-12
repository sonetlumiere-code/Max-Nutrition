import { ShopCategory } from "@prisma/client"
import { z } from "zod"
import { operationalHoursSchema } from "./operational-hours-validation"

export const shopSchema = z.object({
  key: z.string().min(1, { message: "Ingresa el dominio de la tienda." }),
  name: z.string().min(1, { message: "Ingresa el nombre de la tienda." }),
  description: z
    .string()
    .min(1, { message: "Ingresa la descripción de la tienda." }),
  title: z.string().optional(),
  shopCategory: z.nativeEnum(ShopCategory, {
    errorMap: () => {
      return { message: "Selecciona un grupo de categoría." }
    },
  }),
  isActive: z.boolean().optional().default(true),
  operationalHours: z.array(operationalHoursSchema).optional(),
})

export type ShopSchema = z.infer<typeof shopSchema>

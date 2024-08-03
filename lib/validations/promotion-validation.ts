import { z } from "zod"

export const promotionSchema = z.object({
  name: z.string().min(1, { message: "Ingresa el nombre de la promoción." }),
  description: z
    .string()
    .min(1, { message: "Ingresa la descripción de la promoción." }),
  discount: z.coerce
    .number()
    .min(1, { message: "Porcentaje mínimo 1%." })
    .max(100, { message: "Porcentaje máximo 100%." }),
  categories: z.array(
    z.object({
      categoryId: z.string().min(1, { message: "Selecciona una categoría." }),
      quantity: z.coerce.number().min(1, { message: "Ingresa la cantidad." }),
    })
  ),
})

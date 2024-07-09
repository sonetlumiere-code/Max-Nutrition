import { UnitOfMeasurement } from "@prisma/client"
import { z } from "zod"

export const ingredientSchema = z.object({
  name: z.string().min(1, { message: "Ingresa el nombre del ingrediente." }),
  unit: z.nativeEnum(UnitOfMeasurement, {
    errorMap: (issue, ctx) => {
      return { message: "Selecciona la unidad de medida." }
    },
  }),
  price: z.coerce
    .number()
    .min(1, { message: "Ingresa el precio del ingrediente." }),
  waste: z.coerce
    .number()
    .min(0, { message: "Porcentaje mínimo 0%." })
    .max(100, { message: "Porcentaje máximo 100%." })
    .optional(),
  carbs: z.coerce.number(),
  proteins: z.coerce.number(),
  fats: z.coerce.number(),
  fiber: z.coerce.number(),
})

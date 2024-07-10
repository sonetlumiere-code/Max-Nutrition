import { z } from "zod"

export const recipeSchema = z.object({
  name: z.string().min(1, { message: "Ingresa el nombre de la receta." }),
  description: z.string().optional(),
  ingredients: z.array(
    z.object({
      ingredientId: z
        .string()
        .min(1, { message: "Selecciona el ingrediente." }),
      quantity: z.coerce.number().min(1, { message: "Ingresa la cantidad." }),
    })
  ),
})

import { z } from "zod"

export const recipeSchema = z.object({
  name: z.string().min(1, { message: "Ingresa el nombre de la receta." }),
  description: z.string().optional(),
})

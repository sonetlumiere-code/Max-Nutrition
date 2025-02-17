import { z } from "zod"

export const productRecipeTypeSchema = z.object({
  name: z.string().min(1, { message: "Ingresa el nombre del tipo de receta." }),
})

export type ProductRecipeSchema = z.infer<typeof productRecipeTypeSchema>

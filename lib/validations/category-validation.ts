import { z } from "zod"

export const categorySchema = z.object({
  name: z.string().min(1, { message: "Ingresa el nombre de la categoría." }),
  categoriesIds: z.string().array().optional(),
  promotionsIds: z.string().array().optional(),
})

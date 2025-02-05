import { CategoryGroup } from "@prisma/client"
import { z } from "zod"

export const categorySchema = z.object({
  name: z.string().min(1, { message: "Ingresa el nombre de la categoría." }),
  productsIds: z.string().array().optional(),
  promotionsIds: z.string().array().optional(),
  group: z.nativeEnum(CategoryGroup, {
    errorMap: () => {
      return { message: "Selecciona el grupo de categoría." }
    },
  }),
})

export type CategorySchema = z.infer<typeof categorySchema>

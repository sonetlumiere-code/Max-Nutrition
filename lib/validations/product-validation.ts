import { z } from "zod"

const MAX_FILE_SIZE = 400000
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]

export const productSchema = z.object({
  name: z.string().min(1, { message: "Ingresa el nombre del producto." }),
  description: z.string().optional(),
  price: z.coerce
    .number()
    .min(0.1, { message: "Ingresa el precio del producto." }),
  promotionalPrice: z.coerce.number().optional(),
  featured: z.boolean(),
  stock: z.boolean(),
  show: z.boolean(),
  image: z.string().optional(),
  imageFile: z
    .any()
    .refine(
      (files) =>
        files?.length === 0 ? true : files?.[0]?.size <= MAX_FILE_SIZE,
      { message: "La imagen es requerida." }
    )
    .refine(
      (files) =>
        files?.length === 0
          ? true
          : ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      { message: "La imagen debe ser de tipo .jpg, .jpeg, .png o .webp" }
    )
    .optional(),
  recipeId: z.string().min(1, { message: "Debes seleccionar una receta." }),
  categoriesIds: z
    .array(z.string())
    .min(1, { message: "Debes seleccionar al menos una categoría." }),
})

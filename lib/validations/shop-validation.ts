import { ShopCategory } from "@prisma/client"
import { z } from "zod"
import { operationalHoursSchema } from "./operational-hours-validation"

const MAX_FILE_SIZE = 400000
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]

export const shopSchema = z.object({
  key: z.string().min(1, { message: "Ingresa el dominio de la tienda." }),
  name: z.string().min(1, { message: "Ingresa el nombre de la tienda." }),
  title: z.string().min(1, { message: "Ingresa el título de la tienda." }),
  description: z
    .string()
    .min(1, { message: "Ingresa la descripción de la tienda." }),
  message: z.string().optional(),
  shopCategory: z.nativeEnum(ShopCategory, {
    errorMap: () => {
      return { message: "Selecciona un grupo de categoría." }
    },
  }),
  bannerImage: z.string().optional(),
  bannerImageFile: z
    .any()
    .refine(
      (files) =>
        files?.length === 0 ? true : files?.[0]?.size <= MAX_FILE_SIZE,
      { message: `La imagen debe pesar menos de ${MAX_FILE_SIZE / 100000}MB.` }
    )
    .refine(
      (files) =>
        files?.length === 0
          ? true
          : ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      { message: "La imagen debe ser de tipo .jpg, .jpeg, .png o .webp" }
    )
    .optional(),
  isActive: z.boolean().optional().default(true),
  operationalHours: z.array(operationalHoursSchema).optional(),
})

export type ShopSchema = z.infer<typeof shopSchema>

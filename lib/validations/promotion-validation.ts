import { PromotionDiscountType } from "@prisma/client"
import { z } from "zod"

export const promotionSchema = z
  .object({
    name: z.string().min(1, { message: "Ingresa el nombre de la promoción." }),
    description: z
      .string()
      .min(1, { message: "Ingresa la descripción de la promoción." }),
    discountType: z.nativeEnum(PromotionDiscountType),
    discount: z.coerce
      .number()
      .min(0, { message: "El descuento debe ser mayor o igual a 0." }),

    isActive: z.boolean(),
    categories: z.array(
      z.object({
        categoryId: z.string().min(1, { message: "Selecciona una categoría." }),
        quantity: z.coerce.number().min(1, { message: "Ingresa la cantidad." }),
      })
    ),
  })
  .superRefine((data, ctx) => {
    if (data.discountType === PromotionDiscountType.Percentage) {
      if (data.discount < 1 || data.discount > 100) {
        ctx.addIssue({
          code: "custom",
          path: ["discount"],
          message: "Porcentaje mínimo 1% y máximo 100%.",
        })
      }
    } else {
      if (data.discount < 1) {
        ctx.addIssue({
          code: "custom",
          path: ["discount"],
          message: "El descuento debe ser mayor a 0.",
        })
      }
    }
  })

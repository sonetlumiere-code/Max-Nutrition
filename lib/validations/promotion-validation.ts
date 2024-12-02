import {
  PaymentMethod,
  PromotionDiscountType,
  ShippingMethod,
} from "@prisma/client"
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
    allowedPaymentMethods: z
      .array(z.nativeEnum(PaymentMethod))
      .nonempty({ message: "Debes seleccionar al menos un método de pago." }),
    allowedShippingMethods: z
      .array(z.nativeEnum(ShippingMethod))
      .nonempty({ message: "Debes seleccionar al menos un método de envío." }),
  })
  .superRefine((data, ctx) => {
    // Validate discount range based on type
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

    // Check for duplicate categories
    const categoryIds = data.categories.map((cat) => cat.categoryId)
    const uniqueCategoryIds = new Set(categoryIds)

    console.log(categoryIds)

    if (categoryIds.length !== uniqueCategoryIds.size) {
      console.log("err")
      ctx.addIssue({
        code: "custom",
        path: ["categories"],
        message: "No puedes seleccionar categorías duplicadas.",
      })
    }
  })

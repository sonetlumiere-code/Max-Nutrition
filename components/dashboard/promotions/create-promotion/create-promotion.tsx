"use client"

import { createPromotion } from "@/actions/promotions/create-promotion"
import PromotionForm from "@/components/dashboard/promotions/promotion-form"
import {
  Category,
  PaymentMethod,
  PromotionDiscountType,
  ShippingMethod,
  ShopCategory,
} from "@prisma/client"

const CreatePromotion = ({ categories }: { categories: Category[] | null }) => (
  <PromotionForm
    categories={categories}
    defaultValues={{
      name: "",
      description: "",
      isActive: true,
      discountType: PromotionDiscountType.FIXED,
      discount: 0,
      maxApplicableTimes: null,
      shopCategory: ShopCategory.FOOD,
      categories: [{ categoryId: "", quantity: 0 }],
      allowedPaymentMethods: [PaymentMethod.CASH],
      allowedShippingMethods: [
        ShippingMethod.DELIVERY,
        ShippingMethod.TAKE_AWAY,
      ],
    }}
    guardar={createPromotion}
    titulo='Agregar Promoción'
    avisoExito={{
      title: "Nueva promoción creada",
      description: "La promoción ha sido creada correctamente.",
    }}
    tituloError='Error creando promoción'
  />
)

export default CreatePromotion

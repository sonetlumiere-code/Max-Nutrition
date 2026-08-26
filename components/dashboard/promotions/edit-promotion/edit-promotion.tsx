"use client"

import { editPromotion } from "@/actions/promotions/edit-promotion"
import PromotionForm from "@/components/dashboard/promotions/promotion-form"
import { PromotionSchema } from "@/lib/validations/promotion-validation"
import { PopulatedPromotion } from "@/types/types"
import { Category } from "@prisma/client"

type EditPromotionProps = {
  promotion: PopulatedPromotion
  categories: Category[] | null
}

const EditPromotion = ({ promotion, categories }: EditPromotionProps) => (
  <PromotionForm
    categories={categories}
    defaultValues={{
      name: promotion.name,
      description: promotion.description || "",
      isActive: promotion.isActive,
      discountType: promotion.discountType,
      discount: promotion.discount,
      maxApplicableTimes: promotion.maxApplicableTimes ?? null,
      shopCategory: promotion.shopCategory,
      categories: promotion.categories,
      allowedPaymentMethods: promotion.allowedPaymentMethods,
      allowedShippingMethods: promotion.allowedShippingMethods,
    }}
    guardar={(values: PromotionSchema) =>
      editPromotion({ id: promotion.id, values })
    }
    titulo='Editar Promoción'
    avisoExito={{
      title: "Promoción actualizada",
      description: "La promoción se actualizó correctamente.",
    }}
    tituloError='Error actualizando promoción.'
  />
)

export default EditPromotion

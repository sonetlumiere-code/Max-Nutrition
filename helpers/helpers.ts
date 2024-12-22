import { PopulatedPromotion, PromotionToApply } from "@/types/types"
import {
  Category,
  CustomerAddressLabel,
  DayOfWeek,
  Measurement,
  OrderStatus,
  PaymentMethod,
  ShippingMethod,
} from "@prisma/client"

export const translateUnit = (measurement: Measurement): string => {
  switch (measurement) {
    case Measurement.GRAM:
      return "Gramo"
    case Measurement.MILLILITER:
      return "Mililitro"
    case Measurement.UNIT:
      return "Unidad"
    default:
      return "Desconocido"
  }
}

export const translateAddressLabel = (value: CustomerAddressLabel) => {
  switch (value) {
    case CustomerAddressLabel.HOME:
      return "Casa"
    case CustomerAddressLabel.WORK:
      return "Trabajo"
    default:
      return "Otro"
  }
}

export function translateOrderStatus(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.PENDING:
      return "Pendiente"
    case OrderStatus.ACCEPTED:
      return "Aceptado"
    case OrderStatus.COMPLETED:
      return "Completado"
    case OrderStatus.CANCELLED:
      return "Cancelado"
    default:
      return "Desconocido"
  }
}

export function translatePaymentMethod(paymentMethod: PaymentMethod): string {
  switch (paymentMethod) {
    case PaymentMethod.BANK_TRANSFER:
      return "Transferencia bancaria"
    case PaymentMethod.CASH:
      return "Efectivo"
    case PaymentMethod.CREDIT_CARD:
      return "Tarjeta de crédito"
    case PaymentMethod.DEBIT_CARD:
      return "Tarjeta de débito"
    case PaymentMethod.MERCADO_PAGO:
      return "Mercado Pago"
    default:
      return "Otro"
  }
}

export function translateShippingMethod(
  shippingMethod: ShippingMethod
): string {
  switch (shippingMethod) {
    case ShippingMethod.DELIVERY:
      return "Envío a domicilio"
    case ShippingMethod.TAKE_AWAY:
      return "Retiro por sucursal"
    default:
      return "Otro"
  }
}

export function translateDayOfWeek(dayOfWeek: DayOfWeek): string {
  switch (dayOfWeek) {
    case DayOfWeek.MONDAY:
      return "Lunes"
    case DayOfWeek.TUESDAY:
      return "Martes"
    case DayOfWeek.WEDNESDAY:
      return "Miércoles"
    case DayOfWeek.THURSDAY:
      return "Jueves"
    case DayOfWeek.FRIDAY:
      return "Viernes"
    case DayOfWeek.SATURDAY:
      return "Sábado"
    case DayOfWeek.SUNDAY:
      return "Domingo"
    default:
      return dayOfWeek
  }
}

export function calculatePromotions({
  items,
  promotions,
  subtotal,
}: {
  items: {
    product: { categories?: Category[] }
    quantity: number
  }[]
  promotions: PopulatedPromotion[]
  subtotal: number
}) {
  const subtotalPrice = subtotal
  let totalDiscountAmount = 0
  let appliedPromotions: PromotionToApply[] = []

  if (!promotions?.length) {
    return {
      appliedPromotions,
      subtotalPrice,
      totalDiscountAmount,
      finalPrice: subtotalPrice,
    }
  }

  const categoryCount: Record<string, number> = {}

  items.forEach((item) => {
    const itemQuantity = item.quantity
    item.product.categories?.forEach((category: Category) => {
      const categoryId = category.id
      categoryCount[categoryId] =
        (categoryCount[categoryId] || 0) + itemQuantity
    })
  })

  promotions.forEach((promotion) => {
    if (promotion.discountType === "FIXED" && promotion.categories?.length) {
      let applicable = true
      let maxIterations = Infinity

      promotion.categories.forEach(({ categoryId, quantity }) => {
        const availableQuantity = categoryCount[categoryId] || 0
        const iterations = Math.floor(availableQuantity / quantity)

        if (iterations === 0) {
          applicable = false
        }
        maxIterations = Math.min(maxIterations, iterations)
      })

      const cappedIterations = Math.min(
        maxIterations,
        promotion.maxApplicableTimes || Infinity
      )

      if (applicable && cappedIterations > 0) {
        const discountAmount = cappedIterations * promotion.discount
        totalDiscountAmount += discountAmount
        appliedPromotions.push({
          ...promotion,
          appliedTimes: cappedIterations,
        })
      }
    }
  })

  const finalPrice = subtotalPrice - totalDiscountAmount

  return {
    appliedPromotions,
    subtotalPrice,
    totalDiscountAmount,
    finalPrice,
  }
}

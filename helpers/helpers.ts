import {
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
      return "DELIVERY"
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
      return dayOfWeek // Return the original value as a fallback
  }
}

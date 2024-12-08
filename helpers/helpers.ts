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
    case CustomerAddressLabel.Home:
      return "Casa"
    case CustomerAddressLabel.Work:
      return "Trabajo"
    default:
      return "Otro"
  }
}

export function translateOrderStatus(status: OrderStatus): string {
  switch (status) {
    case "Pending":
      return "Pendiente"
    case "Accepted":
      return "Aceptado"
    case "Completed":
      return "Completado"
    case "Cancelled":
      return "Cancelado"
    default:
      return "Desconocido"
  }
}

export function translatePaymentMethod(paymentMethod: PaymentMethod): string {
  switch (paymentMethod) {
    case PaymentMethod.BankTransfer:
      return "Transferencia bancaria"
    case PaymentMethod.Cash:
      return "Efectivo"
    case PaymentMethod.CreditCard:
      return "Tarjeta de crédito"
    case PaymentMethod.DebitCard:
      return "Tarjeta de débito"
    case PaymentMethod.MercadoPago:
      return "Mercado Pago"
    default:
      return "Otro"
  }
}

export function translateShippingMethod(
  shippingMethod: ShippingMethod
): string {
  switch (shippingMethod) {
    case ShippingMethod.Delivery:
      return "Delivery"
    case ShippingMethod.TakeAway:
      return "Retiro por sucursal"
    default:
      return "Otro"
  }
}

export function translateDayOfWeek(dayOfWeek: DayOfWeek): string {
  switch (dayOfWeek) {
    case DayOfWeek.Monday:
      return "Lunes"
    case DayOfWeek.Tuesday:
      return "Martes"
    case DayOfWeek.Wednesday:
      return "Miércoles"
    case DayOfWeek.Thursday:
      return "Jueves"
    case DayOfWeek.Friday:
      return "Viernes"
    case DayOfWeek.Saturday:
      return "Sábado"
    case DayOfWeek.Sunday:
      return "Domingo"
    default:
      return dayOfWeek // Return the original value as a fallback
  }
}

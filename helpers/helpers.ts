import { AddressLabel, Measurement, OrderStatus } from "@prisma/client"

export const unitToSpanish = (measurement: Measurement): string => {
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

export const getAddressLabelDisplay = (value: AddressLabel) => {
  switch (value) {
    case AddressLabel.Home:
      return "Casa"
    case AddressLabel.Work:
      return "Trabajo"
    default:
      return "Otro"
  }
}

export function translateOrderStatus(status: string): string {
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

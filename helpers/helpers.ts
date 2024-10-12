import { AddressLabel, Measurement } from "@prisma/client"

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

export function getStatusBadgeClass(status: string): string {
  const statusClasses: { [key: string]: string } = {
    Pending: "bg-amber-500 hover:bg-amber-500/80",
    Accepted: "bg-sky-500 hover:bg-sky-500/80",
    Completed: "bg-emerald-500 hover:bg-emerald-500/80",
    Cancelled: "bg-destructive hover:bg-destructive/80",
  }

  return statusClasses[status] || ""
}

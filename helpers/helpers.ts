import { UnitOfMeasurement } from "@prisma/client"

export const unitToSpanish = (unit: UnitOfMeasurement): string => {
  switch (unit) {
    case UnitOfMeasurement.GRAM:
      return "Gramo"
    case UnitOfMeasurement.MILLILITER:
      return "Mililitro"
    case UnitOfMeasurement.UNIT:
      return "Unidad"
    default:
      return "Desconocido"
  }
}

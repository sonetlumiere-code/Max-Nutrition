import { ExtendedUser } from "@/types/next-auth"
import { PermissionKey, TimePeriod } from "@/types/types"
import {
  ActionKey,
  ShopCategory,
  CustomerAddressLabel,
  DayOfWeek,
  IngredientVariantScope,
  Measurement,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Permission,
  ShippingMethod,
  SubjectKey,
} from "@prisma/client"

/**
 * Traducciones al español del dominio, permisos y un par de utilidades.
 *
 * Lo que vive acá no comparte tema: son las piezas que no llegaron a formar un
 * módulo propio. La lógica de negocio que estaba mezclada se mudó a
 * `promotions.ts`, `ingredients.ts`, `shop-hours.ts` y `business-time.ts`.
 */

export const translateShopCategory = (group: ShopCategory): string => {
  switch (group) {
    case ShopCategory.FOOD:
      return "Viandas"
    case ShopCategory.BAKERY:
      return "Pastelería"
    default:
      return "Desconocido"
  }
}

export const translateUnit = (measurement: Measurement): string => {
  switch (measurement) {
    case Measurement.GRAM:
      return "Gramo (g)"
    case Measurement.MILLIGRAM:
      return "Miligramo (mg)"
    case Measurement.KILOGRAM:
      return "Kilogramo (Kg)"
    case Measurement.MILLILITER:
      return "Mililitro (mL)"
    case Measurement.LITER:
      return "Litro (L)"
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

export function translateIngredientVariantScope(
  scope: IngredientVariantScope
): string {
  switch (scope) {
    case IngredientVariantScope.ALWAYS:
      return "Siempre"
    case IngredientVariantScope.ONLY_WITH_SALT:
      return "Solo con sal"
    case IngredientVariantScope.ONLY_WITHOUT_SALT:
      return "Solo sin sal"
    default:
      return "Siempre"
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

export function translatePaymentStatus(paymentStatus: PaymentStatus): string {
  switch (paymentStatus) {
    case PaymentStatus.PENDING:
      return "Pago pendiente"
    case PaymentStatus.PAID:
      return "Pagado"
    case PaymentStatus.FAILED:
      return "Pago fallido"
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
      return "Retiro por local"
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

export function translateTimePeriod(period: TimePeriod): string {
  switch (period) {
    case "week":
      return "Semanal"
    case "month":
      return "Mensual"
    case "year":
      return "Anual"
    case "all":
      return "Todo"
  }
}

export function translateSubject(subject: SubjectKey): string {
  switch (subject) {
    case "analytics":
      return "Analítica"
    case "products":
      return "Productos"
    case "categories":
      return "Categorías"
    case "promotions":
      return "Promociones"
    case "orders":
      return "Pedidos"
    case "customers":
      return "Clientes"
    case "customerAddresses":
      return "Direcciones de clientes"
    case "shops":
      return "Tiendas"
    case "shopSettings":
      return "Configuraciones de tienda"
    case "shopBranches":
      return "Sucursales de tienda"
    case "shippingSettings":
      return "Configuraciones de envío"
    case "shippingZones":
      return "Zonas de envío"
    case "ingredients":
      return "Ingredientes"
    case "recipes":
      return "Recetas"
    case "productRecipeTypes":
      return "Tipos de recetas"
    case "roles":
      return "Roles"
    case "permissions":
      return "Permisos"
    case "users":
      return "Usuarios"
    default:
      return subject
  }
}

export function hasPermission(
  user: ExtendedUser,
  permissionKey: PermissionKey
): boolean {
  const [actionKey, subjectKey] = permissionKey.split(":") as [
    ActionKey,
    SubjectKey
  ]

  return (
    user.role?.permissions.some(
      (p) => p.actionKey === actionKey && p.subjectKey === subjectKey
    ) ?? false
  )
}

export function getPermissionsKeys(
  permissions: Permission[] = []
): PermissionKey[] {
  return permissions.map(
    (permission) =>
      `${permission.actionKey}:${permission.subjectKey}` as PermissionKey
  )
}

// Exclude keys from a single object
export function excludeFromObject<
  T extends Record<string, unknown>,
  K extends keyof T
>(obj: T, keys: K[]): Omit<T, K> {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => !keys.includes(key as K))
  ) as Omit<T, K>
}

// Exclude keys from objects in a list
export function excludeFromList<
  T extends Record<string, unknown>,
  K extends keyof T
>(objects: T[], keysToDelete: K[]): Omit<T, K>[] {
  return objects.map((obj) => excludeFromObject(obj, keysToDelete)) as Omit<
    T,
    K
  >[]
}

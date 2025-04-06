import { ExtendedUser } from "@/types/next-auth"
import {
  BaseMeasurement,
  HourGroup,
  PermissionKey,
  PopulatedOrder,
  PopulatedProduct,
  PopulatedPromotion,
  PromotionToApply,
  TimePeriod,
} from "@/types/types"
import {
  ActionKey,
  Category,
  ShopCategory,
  CustomerAddressLabel,
  DayOfWeek,
  Ingredient,
  Measurement,
  OrderStatus,
  PaymentMethod,
  Permission,
  ShippingMethod,
  SubjectKey,
  OperationalHours,
} from "@prisma/client"
import {
  getMonth,
  getYear,
  isWithinInterval,
  startOfWeek,
  subMonths,
  subWeeks,
  subYears,
} from "date-fns"

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

export function calculatePromotions({
  items,
  promotions,
}: {
  items: {
    product: PopulatedProduct
    quantity: number
  }[]
  promotions: PopulatedPromotion[]
}) {
  const subtotalPrice = items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  )

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

export function getBaseMeasurement(measurement: Measurement): BaseMeasurement {
  switch (measurement) {
    case Measurement.UNIT:
      return Measurement.UNIT
    case Measurement.GRAM:
      return Measurement.GRAM
    case Measurement.MILLIGRAM:
      return Measurement.GRAM
    case Measurement.KILOGRAM:
      return Measurement.GRAM
    case Measurement.MILLILITER:
      return Measurement.MILLILITER
    case Measurement.LITER:
      return Measurement.MILLILITER
    default:
      throw new Error(`Unknown measurement unit: ${measurement}`)
  }
}

export const conversionFactors: Record<Measurement, number> = {
  KILOGRAM: 1000, // 1 kilogram = 1000 grams
  GRAM: 1, // Base unit
  MILLIGRAM: 0.001, // 1 milligram = 0.001 grams
  LITER: 1000, // 1 liter = 1000 milliliters
  MILLILITER: 1, // Base unit
  UNIT: 1, // Units are counted as-is
}

export const calculateIngredientData = ({
  ingredient,
  quantity, // This value is assumed to be in the base unit already.
  withWaste = true,
}: {
  ingredient: Ingredient
  quantity: number
  withWaste?: boolean
}) => {
  const baseMeasurement = getBaseMeasurement(ingredient.measurement)

  // Compute the price per base unit
  const conversionFactor = conversionFactors[ingredient.measurement] || 1
  const pricePerBaseUnit =
    ingredient.price / (ingredient.amountPerMeasurement * conversionFactor)

  // Calculate total quantity including waste
  const totalQuantity = quantity * (withWaste ? 1 + ingredient.waste / 100 : 1)

  // Calculate cost using the per–base-unit price
  const cost = totalQuantity * pricePerBaseUnit

  return {
    adjustedQuantity: quantity, // Given in base unit
    totalQuantity, // Including waste
    cost, // Total cost in base unit price
    baseMeasurement, // The base unit (GRAM, MILLILITER, or UNIT)
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

export function getOperationalHoursMessage(
  operationalHours: OperationalHours[]
): string {
  const daysOfWeek = [
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY,
    DayOfWeek.SATURDAY,
    DayOfWeek.SUNDAY,
  ]

  const validOperationalHours = operationalHours
    .filter((hour) => hour.startTime && hour.endTime)
    .sort(
      (a, b) =>
        daysOfWeek.indexOf(a.dayOfWeek as DayOfWeek) -
        daysOfWeek.indexOf(b.dayOfWeek as DayOfWeek)
    )

  if (validOperationalHours.length === 0) return "No hay horarios disponibles"

  const groupConsecutiveDays = (
    hours: typeof validOperationalHours
  ): HourGroup[] => {
    const groups: HourGroup[] = []
    let currentGroup: HourGroup | null = null

    for (let i = 0; i < hours.length; i++) {
      const hour = hours[i]
      const prevDayIndex = daysOfWeek.indexOf(hour.dayOfWeek as DayOfWeek) - 1
      const prevDay = prevDayIndex >= 0 ? daysOfWeek[prevDayIndex] : null

      if (
        currentGroup &&
        hour.startTime === currentGroup.startTime &&
        hour.endTime === currentGroup.endTime &&
        hours[i - 1]?.dayOfWeek === prevDay
      ) {
        currentGroup.endDay = hour.dayOfWeek as DayOfWeek
      } else {
        if (currentGroup) groups.push(currentGroup)
        currentGroup = {
          startDay: hour.dayOfWeek as DayOfWeek,
          endDay: hour.dayOfWeek as DayOfWeek,
          startTime: hour.startTime!, // non-null assertion
          endTime: hour.endTime!, // non-null assertion
        }
      }
    }

    if (currentGroup) groups.push(currentGroup)
    return groups
  }

  const groupedHours = groupConsecutiveDays(validOperationalHours)

  const message = groupedHours
    .map((group) => {
      const isFullDay = group.startTime === "00:00" && group.endTime === "23:59"
      if (group.startDay === group.endDay) {
        return isFullDay
          ? `${translateDayOfWeek(group.startDay)}`
          : `${translateDayOfWeek(group.startDay)}: ${group.startTime} a ${
              group.endTime
            }`
      } else {
        return isFullDay
          ? `de ${translateDayOfWeek(group.startDay)} a ${translateDayOfWeek(
              group.endDay
            )}`
          : `${translateDayOfWeek(group.startDay)} a ${translateDayOfWeek(
              group.endDay
            )} de ${group.startTime} a ${group.endTime}`
      }
    })
    .join(", ")

  return message
}

export function isShopCurrentlyAvailable(
  operationalHours?: OperationalHours[]
): boolean {
  if (!operationalHours) {
    return false
  }
  // Get current date/time in Buenos Aires time zone
  const now = new Date()
  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Argentina/Buenos_Aires",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
  const formattedTime = timeFormatter.format(now)
  const [rawHour, currentMinute] = formattedTime.split(":").map(Number)
  // Adjust hour if it equals 24, converting to 0 (for times after midnight)
  const currentHour = rawHour === 24 ? 0 : rawHour

  // Get the weekday name in English (e.g. "Monday")
  const dayFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Argentina/Buenos_Aires",
    weekday: "long",
  })
  const dayName = dayFormatter.format(now)

  // Map English weekday names to your enum values
  const dayMapping: Record<string, DayOfWeek> = {
    Monday: DayOfWeek.MONDAY,
    Tuesday: DayOfWeek.TUESDAY,
    Wednesday: DayOfWeek.WEDNESDAY,
    Thursday: DayOfWeek.THURSDAY,
    Friday: DayOfWeek.FRIDAY,
    Saturday: DayOfWeek.SATURDAY,
    Sunday: DayOfWeek.SUNDAY,
  }

  const currentDayOfWeek = dayMapping[dayName]

  // Find today's operational hours (ensuring both startTime and endTime are defined)
  const todayHours = operationalHours.find(
    (h) => h.dayOfWeek === currentDayOfWeek && h.startTime && h.endTime
  )

  // Check if hours exist and are non-null
  if (!todayHours || !todayHours.startTime || !todayHours.endTime) return false

  // Parse startTime and endTime
  const [startHour, startMinute] = todayHours.startTime.split(":").map(Number)
  const [endHour, endMinute] = todayHours.endTime.split(":").map(Number)

  // Convert all times to minutes since midnight
  const currentTotal = currentHour * 60 + currentMinute
  const startTotal = startHour * 60 + startMinute
  const endTotal = endHour * 60 + endMinute

  // Check if current time is within the interval
  return currentTotal >= startTotal && currentTotal <= endTotal
}

export const getStartDate = (tab: TimePeriod) => {
  const now = new Date()
  switch (tab) {
    case "week":
      return subWeeks(now, 1)
    case "month":
      return subMonths(now, 1)
    case "year":
      return subYears(now, 1)
    default:
      return null
  }
}

export function groupOrdersByPeriod(orders: PopulatedOrder[], period: TimePeriod) {
  const startDate = getStartDate(period)
  const groupedOrders: { [key: string]: PopulatedOrder[] } = {}

  for (const order of orders) {
    const orderDate = new Date(order.createdAt)
    const isInDateRange = !startDate || isWithinInterval(orderDate, { start: startDate, end: new Date() })
    if (!isInDateRange) continue

    let key = "all"
    if (period === "week") {
      key = startOfWeek(orderDate, { weekStartsOn: 1 }).toISOString()
    } else if (period === "month") {
      const month = getMonth(orderDate) + 1
      const year = getYear(orderDate)
      key = `${year}-${String(month).padStart(2, "0")}`
    } else if (period === "year") {
      key = String(getYear(orderDate))
    }

    groupedOrders[key] ??= []
    groupedOrders[key].push(order)
  }

  if (["week", "month", "year"].includes(period)) {
    const [mostRecentKey] = Object.keys(groupedOrders).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    return { [mostRecentKey]: groupedOrders[mostRecentKey] }
  }

  return groupedOrders
}

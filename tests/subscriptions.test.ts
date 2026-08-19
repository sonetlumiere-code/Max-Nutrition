import { describe, expect, it } from "vitest"
import { DayOfWeek } from "@prisma/client"
import {
  businessWeekday,
  isSubscriptionDue,
  translateWeekday,
} from "@/helpers/subscriptions"
import { calculateSubtotal, calculateTotal, roundMoney } from "@/lib/orders/pricing"
import { matchesCronSecret } from "@/lib/cron/auth"

// Martes 18 de agosto de 2026, 15:00 en Argentina (18:00 UTC).
const MARTES = new Date("2026-08-18T18:00:00.000Z")

const subscription = (overrides: Partial<Parameters<typeof isSubscriptionDue>[0]> = {}) => ({
  weekday: DayOfWeek.TUESDAY,
  isActive: true,
  lastRunAt: null,
  ...overrides,
})

describe("businessWeekday", () => {
  it("usa el día del negocio, no el UTC", () => {
    // Martes 22:00 en Argentina ya es miércoles en UTC.
    expect(businessWeekday(new Date("2026-08-19T01:00:00.000Z"))).toBe(
      DayOfWeek.TUESDAY
    )
  })

  it("mapea correctamente toda la semana", () => {
    const esperado: [string, DayOfWeek][] = [
      ["2026-08-17T15:00:00.000Z", DayOfWeek.MONDAY],
      ["2026-08-18T15:00:00.000Z", DayOfWeek.TUESDAY],
      ["2026-08-19T15:00:00.000Z", DayOfWeek.WEDNESDAY],
      ["2026-08-20T15:00:00.000Z", DayOfWeek.THURSDAY],
      ["2026-08-21T15:00:00.000Z", DayOfWeek.FRIDAY],
      ["2026-08-22T15:00:00.000Z", DayOfWeek.SATURDAY],
      ["2026-08-23T15:00:00.000Z", DayOfWeek.SUNDAY],
    ]

    esperado.forEach(([iso, weekday]) => {
      expect(businessWeekday(new Date(iso))).toBe(weekday)
    })
  })
})

describe("isSubscriptionDue", () => {
  it("genera el pedido el día que corresponde", () => {
    expect(isSubscriptionDue(subscription(), MARTES)).toBe(true)
  })

  it("no genera nada otro día de la semana", () => {
    expect(
      isSubscriptionDue(subscription({ weekday: DayOfWeek.FRIDAY }), MARTES)
    ).toBe(false)
  })

  it("no genera nada si está pausada", () => {
    expect(isSubscriptionDue(subscription({ isActive: false }), MARTES)).toBe(
      false
    )
  })

  it("no repite el pedido si ya corrió hoy", () => {
    // Corrió a la mañana; el cron vuelve a ejecutarse por un reintento.
    const estaMañana = new Date("2026-08-18T12:00:00.000Z")

    expect(
      isSubscriptionDue(subscription({ lastRunAt: estaMañana }), MARTES)
    ).toBe(false)
  })

  it("vuelve a generar a la semana siguiente", () => {
    const semanaPasada = new Date("2026-08-11T12:00:00.000Z")

    expect(
      isSubscriptionDue(subscription({ lastRunAt: semanaPasada }), MARTES)
    ).toBe(true)
  })

  it("compara días del negocio, no instantes", () => {
    // Corrió el lunes 23:00 Argentina, que en UTC ya es martes: si se
    // comparara en UTC, se saltearía el pedido del martes.
    const lunesTarde = new Date("2026-08-18T02:00:00.000Z")

    expect(
      isSubscriptionDue(subscription({ lastRunAt: lunesTarde }), MARTES)
    ).toBe(true)
  })

  it("un pedido de las 23:00 sigue contando como del mismo día", () => {
    const martesTemprano = new Date("2026-08-18T12:00:00.000Z")
    const martesTarde = new Date("2026-08-19T01:00:00.000Z")

    expect(
      isSubscriptionDue(subscription({ lastRunAt: martesTemprano }), martesTarde)
    ).toBe(false)
  })
})

describe("translateWeekday", () => {
  it("traduce todos los días", () => {
    Object.values(DayOfWeek).forEach((day) => {
      expect(translateWeekday(day)).toBeTruthy()
    })
    expect(translateWeekday(DayOfWeek.WEDNESDAY)).toBe("Miércoles")
  })
})

describe("matchesCronSecret", () => {
  const SECRETO = "secreto-del-cron"

  it("acepta el encabezado que envía Vercel", () => {
    expect(matchesCronSecret(`Bearer ${SECRETO}`, SECRETO)).toBe(true)
  })

  it("rechaza un secreto equivocado", () => {
    expect(matchesCronSecret("Bearer otro-secreto", SECRETO)).toBe(false)
  })

  it("exige el prefijo Bearer", () => {
    expect(matchesCronSecret(SECRETO, SECRETO)).toBe(false)
  })

  it("rechaza cuando no hay encabezado", () => {
    expect(matchesCronSecret(null, SECRETO)).toBe(false)
    expect(matchesCronSecret(undefined, SECRETO)).toBe(false)
    expect(matchesCronSecret("", SECRETO)).toBe(false)
  })

  it("rechaza todo si no hay secreto configurado", () => {
    // Sin configurar, ningún encabezado debe pasar: ni siquiera uno vacío.
    expect(matchesCronSecret("Bearer lo-que-sea", undefined)).toBe(false)
    expect(matchesCronSecret("Bearer ", "")).toBe(false)
  })

  it("no se deja pasar por un prefijo del secreto", () => {
    expect(matchesCronSecret("Bearer secreto", SECRETO)).toBe(false)
    expect(matchesCronSecret(`Bearer ${SECRETO}-de-mas`, SECRETO)).toBe(false)
  })
})

describe("aritmética de precios compartida", () => {
  it("redondea a dos decimales", () => {
    expect(roundMoney(3999.9999999995)).toBe(4000)
    expect(roundMoney(10.005)).toBe(10.01)
  })

  it("suma el subtotal de los ítems", () => {
    const subtotal = calculateSubtotal([
      { product: { price: 1500.5 }, quantity: 3 },
      { product: { price: 800 }, quantity: 2 },
    ])

    expect(subtotal).toBe(6101.5)
  })

  it("suma el envío después del descuento", () => {
    // 5000 de subtotal, 1000 de descuento, 1500 de envío.
    expect(calculateTotal(4000, 1500)).toBe(5500)
  })

  it("no arrastra errores de punto flotante", () => {
    expect(calculateTotal(0.1 + 0.2, 0)).toBe(0.3)
  })
})

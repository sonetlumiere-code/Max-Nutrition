import { afterEach, describe, expect, it, vi } from "vitest"
import {
  getPeriodRange,
  getRangeFromDates,
  toBusinessDateString,
} from "@/helpers/date-range"

/**
 * El negocio opera en Argentina (UTC−3, sin horario de verano), así que la
 * medianoche local es siempre las 03:00 UTC. Los tests afirman instantes UTC
 * exactos: si el cálculo dependiera del huso de la máquina, fallarían al
 * correr en otro lado (por ejemplo en CI, que suele estar en UTC).
 */
const MEDIANOCHE_ARG = "T03:00:00.000Z"

afterEach(() => {
  vi.useRealTimers()
})

describe("getRangeFromDates — rangos válidos", () => {
  it("cubre desde la medianoche del primer día hasta el final del último", () => {
    const range = getRangeFromDates("2026-05-01", "2026-05-31")!

    expect(range.start.toISOString()).toBe(`2026-05-01${MEDIANOCHE_ARG}`)
    // El 31 a las 23:59:59.999 en Argentina es el 1 de junio 02:59:59.999 UTC.
    expect(range.end.toISOString()).toBe("2026-06-01T02:59:59.999Z")
  })

  it("acepta un rango de un solo día completo", () => {
    const range = getRangeFromDates("2026-05-22", "2026-05-22")!

    expect(range.start.toISOString()).toBe(`2026-05-22${MEDIANOCHE_ARG}`)
    expect(range.end.toISOString()).toBe("2026-05-23T02:59:59.999Z")
    expect(range.end.getTime() - range.start.getTime()).toBe(
      24 * 60 * 60 * 1000 - 1
    )
  })

  it("cruza el fin de año sin problemas", () => {
    const range = getRangeFromDates("2026-12-31", "2027-01-01")!

    expect(range.start.toISOString()).toBe(`2026-12-31${MEDIANOCHE_ARG}`)
    expect(range.end.toISOString()).toBe("2027-01-02T02:59:59.999Z")
  })

  it("incluye el 29 de febrero en año bisiesto", () => {
    const range = getRangeFromDates("2028-02-29", "2028-02-29")

    expect(range).not.toBeNull()
    expect(range!.start.toISOString()).toBe(`2028-02-29${MEDIANOCHE_ARG}`)
  })
})

describe("getRangeFromDates — entradas inválidas", () => {
  it.each([
    ["falta el hasta", "2026-05-01", undefined],
    ["falta el desde", undefined, "2026-05-01"],
    ["ambos vacíos", undefined, undefined],
    ["otro formato", "01/05/2026", "2026-05-31"],
    ["rango invertido", "2026-05-31", "2026-05-01"],
    ["mes 13", "2026-13-01", "2027-12-01"],
    ["31 de abril", "2026-04-31", "2026-05-05"],
    ["29 de febrero en año no bisiesto", "2026-02-29", "2026-03-05"],
    ["día cero", "2026-05-00", "2026-05-05"],
    ["texto suelto", "hoy", "mañana"],
  ])("devuelve null: %s", (_caso, from, to) => {
    expect(getRangeFromDates(from, to)).toBeNull()
  })

  it("rechaza el desborde aunque el rango quede ordenado", () => {
    // new Date(2026, 12, 1) normaliza en silencio a enero de 2027: sin la
    // comprobación de ida y vuelta, esto pasaría como un rango válido.
    expect(getRangeFromDates("2026-13-01", "2027-06-01")).toBeNull()
  })
})

describe("getPeriodRange — períodos calendario", () => {
  it("la semana arranca el lunes a la medianoche argentina", () => {
    // Miércoles 20 de mayo de 2026, 15:00 en Argentina.
    vi.setSystemTime(new Date("2026-05-20T18:00:00.000Z"))

    const { start, previousStart, previousEnd } = getPeriodRange("week")

    expect(start.toISOString()).toBe(`2026-05-18${MEDIANOCHE_ARG}`)
    expect(previousStart.toISOString()).toBe(`2026-05-11${MEDIANOCHE_ARG}`)
    expect(previousEnd.toISOString()).toBe(start.toISOString())
  })

  it("el lunes temprano la semana ya empezó ese mismo día", () => {
    // Lunes 18 de mayo, 00:30 en Argentina (03:30 UTC).
    vi.setSystemTime(new Date("2026-05-18T03:30:00.000Z"))

    expect(getPeriodRange("week").start.toISOString()).toBe(
      `2026-05-18${MEDIANOCHE_ARG}`
    )
  })

  it("el domingo cierra la semana que arrancó el lunes previo", () => {
    // Domingo 24 de mayo, 20:00 en Argentina.
    vi.setSystemTime(new Date("2026-05-24T23:00:00.000Z"))

    expect(getPeriodRange("week").start.toISOString()).toBe(
      `2026-05-18${MEDIANOCHE_ARG}`
    )
  })

  it("el mes arranca el día 1 y el anterior es el mes previo", () => {
    vi.setSystemTime(new Date("2026-05-20T18:00:00.000Z"))

    const { start, previousStart } = getPeriodRange("month")

    expect(start.toISOString()).toBe(`2026-05-01${MEDIANOCHE_ARG}`)
    expect(previousStart.toISOString()).toBe(`2026-04-01${MEDIANOCHE_ARG}`)
  })

  it("en enero, el mes anterior es diciembre del año pasado", () => {
    vi.setSystemTime(new Date("2026-01-10T15:00:00.000Z"))

    expect(getPeriodRange("month").previousStart.toISOString()).toBe(
      `2025-12-01${MEDIANOCHE_ARG}`
    )
  })

  it("el año arranca el 1 de enero", () => {
    vi.setSystemTime(new Date("2026-05-20T18:00:00.000Z"))

    const { start, previousStart } = getPeriodRange("year")

    expect(start.toISOString()).toBe(`2026-01-01${MEDIANOCHE_ARG}`)
    expect(previousStart.toISOString()).toBe(`2025-01-01${MEDIANOCHE_ARG}`)
  })

  it("un pedido de las 22:00 del 31 cae en ese mes, no en el siguiente", () => {
    // 31 de mayo 22:00 en Argentina son las 01:00 UTC del 1 de junio: si los
    // límites se calcularan en UTC, el pedido se contaría en junio.
    vi.setSystemTime(new Date("2026-06-01T01:00:00.000Z"))

    const { start } = getPeriodRange("month")
    const pedido = new Date("2026-06-01T01:00:00.000Z")

    expect(start.toISOString()).toBe(`2026-05-01${MEDIANOCHE_ARG}`)
    expect(pedido >= start).toBe(true)
  })
})

describe("toBusinessDateString", () => {
  it("usa el día del negocio, no el del huso local", () => {
    // 1 de junio 01:00 UTC sigue siendo 31 de mayo en Argentina.
    expect(toBusinessDateString(new Date("2026-06-01T01:00:00.000Z"))).toBe(
      "2026-05-31"
    )
  })

  it("rellena mes y día con cero a la izquierda", () => {
    expect(toBusinessDateString(new Date("2026-01-05T15:00:00.000Z"))).toBe(
      "2026-01-05"
    )
  })
})

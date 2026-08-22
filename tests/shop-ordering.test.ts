import { afterEach, describe, expect, it, vi } from "vitest"
import { DayOfWeek, OperationalHours } from "@prisma/client"
import { getShopOrderingState } from "@/helpers/shop-ordering"

/**
 * El negocio puede mostrar el catálogo sin tomar pedidos. Son dos cosas
 * separadas —el interruptor de la venta online y el horario de atención— y la
 * vitrina tiene que distinguirlas para no decirle al cliente "podés pedir de 9
 * a 18" cuando no se va a poder pedir en toda la semana.
 */

const horario = (
  startTime: string | null,
  endTime: string | null
): OperationalHours[] =>
  Object.values(DayOfWeek).map(
    (dayOfWeek) =>
      ({
        dayOfWeek,
        startTime,
        endTime,
      }) as OperationalHours
  )

const SIEMPRE_ABIERTO = horario("00:00", "23:59")
const SIEMPRE_CERRADO = horario(null, null)

afterEach(() => {
  vi.useRealTimers()
})

describe("cuando la tienda toma pedidos", () => {
  it("deja pedir dentro del horario", () => {
    expect(
      getShopOrderingState({
        acceptsOrders: true,
        operationalHours: SIEMPRE_ABIERTO,
      })
    ).toEqual({ puedePedir: true })
  })

  it("fuera del horario avisa que está cerrada, no que no toma pedidos", () => {
    expect(
      getShopOrderingState({
        acceptsOrders: true,
        operationalHours: SIEMPRE_CERRADO,
      })
    ).toEqual({ puedePedir: false, motivo: "fuera-de-horario" })
  })

  it("sin horarios cargados se considera cerrada", () => {
    expect(
      getShopOrderingState({ acceptsOrders: true, operationalHours: [] })
    ).toEqual({ puedePedir: false, motivo: "fuera-de-horario" })
  })
})

describe("cuando el negocio apagó la venta online", () => {
  it("no se puede pedir, aunque esté dentro del horario", () => {
    expect(
      getShopOrderingState({
        acceptsOrders: false,
        operationalHours: SIEMPRE_ABIERTO,
      })
    ).toEqual({ puedePedir: false, motivo: "no-toma-pedidos" })
  })

  it("el interruptor manda sobre el horario, para no prometer un horario que no sirve", () => {
    expect(
      getShopOrderingState({
        acceptsOrders: false,
        operationalHours: SIEMPRE_CERRADO,
      })
    ).toEqual({ puedePedir: false, motivo: "no-toma-pedidos" })
  })

  it("tampoco se puede pedir si ni siquiera hay horarios", () => {
    expect(getShopOrderingState({ acceptsOrders: false }).puedePedir).toBe(false)
  })
})

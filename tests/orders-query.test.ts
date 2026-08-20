import { describe, expect, it } from "vitest"
import {
  ORDERS_ENDPOINT,
  buildOrdersUrl,
  isOrdersKey,
  toPickedDateString,
} from "@/helpers/orders-query"
import { getRangeFromDates } from "@/helpers/date-range"

describe("buildOrdersUrl", () => {
  it("sin rango pide la lista completa", () => {
    expect(buildOrdersUrl(null)).toBe("/api/orders")
    expect(buildOrdersUrl({})).toBe("/api/orders")
  })

  it("manda solo el inicio cuando el filtro es un período", () => {
    const start = new Date("2026-05-18T03:00:00.000Z")

    expect(buildOrdersUrl({ start })).toBe(
      "/api/orders?createdAt%5Bgte%5D=2026-05-18T03%3A00%3A00.000Z"
    )
  })

  it("manda los dos extremos cuando el rango es manual", () => {
    const url = buildOrdersUrl({
      start: new Date("2026-05-01T03:00:00.000Z"),
      end: new Date("2026-06-01T02:59:59.999Z"),
    })

    // Los parámetros llegan como los espera la API: createdAt[gte] y [lte].
    const params = new URL(url, "http://x").searchParams
    expect(params.get("createdAt[gte]")).toBe("2026-05-01T03:00:00.000Z")
    expect(params.get("createdAt[lte]")).toBe("2026-06-01T02:59:59.999Z")
  })

  it("produce una URL distinta por rango, que es lo que separa la caché", () => {
    const semana = buildOrdersUrl({ start: new Date("2026-05-18T03:00:00Z") })
    const mes = buildOrdersUrl({ start: new Date("2026-05-01T03:00:00Z") })

    expect(semana).not.toBe(mes)
  })
})

describe("toPickedDateString", () => {
  it("usa el día que el usuario tocó en el calendario, no el instante UTC", () => {
    // Se prueban los dos extremos del día local: en cualquier huso distinto de
    // UTC, uno de los dos cae en otra fecha al pasarlo a UTC. Así el test falla
    // si alguien reemplaza esto por toISOString(), corra donde corra.
    const alPrincipio = new Date(2026, 4, 18, 0, 0, 0, 0)
    const alFinal = new Date(2026, 4, 18, 23, 59, 59, 999)

    expect(toPickedDateString(alPrincipio)).toBe("2026-05-18")
    expect(toPickedDateString(alFinal)).toBe("2026-05-18")
  })

  it("rellena mes y día con cero a la izquierda", () => {
    expect(toPickedDateString(new Date(2026, 0, 5))).toBe("2026-01-05")
  })

  it("encadena con getRangeFromDates para cubrir el día completo", () => {
    const desde = new Date(2026, 4, 18)
    const hasta = new Date(2026, 4, 18)

    const range = getRangeFromDates(
      toPickedDateString(desde),
      toPickedDateString(hasta)
    )!

    expect(range.start.toISOString()).toBe("2026-05-18T03:00:00.000Z")
    expect(range.end.toISOString()).toBe("2026-05-19T02:59:59.999Z")
  })
})

describe("isOrdersKey", () => {
  it("reconoce la lista con y sin filtros", () => {
    expect(isOrdersKey(ORDERS_ENDPOINT)).toBe(true)
    expect(isOrdersKey(buildOrdersUrl({ start: new Date() }))).toBe(true)
  })

  it("ignora otras claves de SWR", () => {
    expect(isOrdersKey("/api/products")).toBe(false)
    expect(isOrdersKey(["orders"])).toBe(false)
    expect(isOrdersKey(null)).toBe(false)
    expect(isOrdersKey(undefined)).toBe(false)
  })
})

describe("buildOrdersUrl — detalle de recetas", () => {
  it("la lista no pide el árbol de recetas", () => {
    expect(buildOrdersUrl(null)).not.toContain("detail")
    expect(buildOrdersUrl({ start: new Date() })).not.toContain("detail")
  })

  it("la exportación lo pide junto con el rango", () => {
    const url = buildOrdersUrl(
      { start: new Date("2026-05-01T03:00:00.000Z") },
      { withRecipes: true }
    )
    const params = new URL(url, "http://x").searchParams

    expect(params.get("detail")).toBe("recipes")
    expect(params.get("createdAt[gte]")).toBe("2026-05-01T03:00:00.000Z")
  })

  it("sin rango sigue siendo una URL válida", () => {
    expect(buildOrdersUrl(null, { withRecipes: true })).toBe(
      "/api/orders?detail=recipes"
    )
  })
})

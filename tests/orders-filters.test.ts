import { describe, expect, it } from "vitest"
import { OrderStatus, PaymentStatus } from "@prisma/client"
import { buildOrdersWhere } from "@/lib/orders/list-filters"
import { buildOrdersUrl } from "@/helpers/orders-query"

/** Recorre el camino real: la URL que arma el cliente, leída por el servidor. */
const whereFromUrl = (url: string) =>
  buildOrdersWhere(new URL(url, "http://localhost").searchParams)

describe("buildOrdersWhere — rango de fechas", () => {
  it("sin parámetros no filtra nada", () => {
    expect(whereFromUrl(buildOrdersUrl(null))).toEqual({})
  })

  it("traduce el inicio del período que manda la lista", () => {
    const start = new Date("2026-05-18T03:00:00.000Z")

    expect(whereFromUrl(buildOrdersUrl({ start }))).toEqual({
      createdAt: { gte: start },
    })
  })

  it("traduce el rango manual completo", () => {
    const start = new Date("2026-05-01T03:00:00.000Z")
    const end = new Date("2026-06-01T02:59:59.999Z")

    expect(whereFromUrl(buildOrdersUrl({ start, end }))).toEqual({
      createdAt: { gte: start, lte: end },
    })
  })

  it("ignora fechas inválidas en vez de romper la consulta", () => {
    const where = buildOrdersWhere(
      new URLSearchParams({
        "createdAt[gte]": "no es una fecha",
        "createdAt[lte]": "2026-05-31T23:59:59.999Z",
      })
    )

    expect(where).toEqual({
      createdAt: { lte: new Date("2026-05-31T23:59:59.999Z") },
    })
  })

  it("no arma el filtro de fecha si ninguna es válida", () => {
    const where = buildOrdersWhere(
      new URLSearchParams({ "createdAt[gte]": "13/45/2026" })
    )

    expect(where).toEqual({})
  })
})

describe("buildOrdersWhere — resto de los filtros", () => {
  it("acepta estados conocidos", () => {
    const where = buildOrdersWhere(
      new URLSearchParams({
        status: OrderStatus.COMPLETED,
        paymentStatus: PaymentStatus.PAID,
      })
    )

    expect(where).toEqual({
      status: OrderStatus.COMPLETED,
      paymentStatus: PaymentStatus.PAID,
    })
  })

  it("descarta estados que no existen", () => {
    const where = buildOrdersWhere(
      new URLSearchParams({ status: "ENTREGADO", paymentStatus: "DEBE" })
    )

    expect(where).toEqual({})
  })

  it("filtra por tienda, sucursal y cliente", () => {
    const where = buildOrdersWhere(
      new URLSearchParams({
        shopId: "shop-1",
        shopBranchId: "branch-1",
        customerId: "customer-1",
      })
    )

    expect(where).toEqual({
      shopId: "shop-1",
      shopBranchId: "branch-1",
      customerId: "customer-1",
    })
  })
})

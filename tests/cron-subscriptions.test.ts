import { beforeEach, describe, expect, it, vi } from "vitest"
import type { NextRequest } from "next/server"

/**
 * La ruta que Vercel llama todos los días para generar los pedidos de las
 * suscripciones. Es un endpoint público, así que lo único que la protege es el
 * secreto: si eso se afloja, cualquiera puede disparar la generación.
 */

const generateSubscriptionOrders = vi.hoisted(() => vi.fn())

vi.hoisted(() => {
  process.env.CRON_SECRET = "secreto-de-prueba"
})

vi.mock("@/lib/subscriptions/generate-orders", () => ({
  generateSubscriptionOrders,
}))

const { GET } = await import("@/app/api/cron/subscriptions/route")

/** Lo mínimo que la ruta le pide al request. */
const requestWith = (authorization?: string) =>
  ({
    headers: {
      get: (name: string) =>
        name.toLowerCase() === "authorization" ? authorization ?? null : null,
    },
  }) as unknown as NextRequest

beforeEach(() => {
  vi.clearAllMocks()
  generateSubscriptionOrders.mockResolvedValue({ created: [], skipped: [] })
})

describe("cron de suscripciones — quién puede dispararlo", () => {
  it("rechaza una llamada sin autorización", async () => {
    const res = await GET(requestWith())

    expect(res.status).toBe(401)
    expect(generateSubscriptionOrders).not.toHaveBeenCalled()
  })

  it("rechaza un secreto equivocado", async () => {
    const res = await GET(requestWith("Bearer otro-secreto"))

    expect(res.status).toBe(401)
    expect(generateSubscriptionOrders).not.toHaveBeenCalled()
  })

  it("rechaza el secreto correcto sin el prefijo Bearer", async () => {
    const res = await GET(requestWith("secreto-de-prueba"))

    expect(res.status).toBe(401)
    expect(generateSubscriptionOrders).not.toHaveBeenCalled()
  })

  it("acepta el encabezado que manda Vercel", async () => {
    const res = await GET(requestWith("Bearer secreto-de-prueba"))

    expect(res.status).toBe(200)
    expect(generateSubscriptionOrders).toHaveBeenCalledTimes(1)
  })
})

describe("cron de suscripciones — resultado", () => {
  it("devuelve lo que generó", async () => {
    generateSubscriptionOrders.mockResolvedValue({
      created: ["o-1", "o-2"],
      skipped: [],
    })

    const res = await GET(requestWith("Bearer secreto-de-prueba"))

    expect(await res.json()).toEqual({ created: ["o-1", "o-2"], skipped: [] })
  })

  it("responde 500 si la generación falla, para que Vercel reintente", async () => {
    generateSubscriptionOrders.mockRejectedValue(new Error("base caída"))

    const res = await GET(requestWith("Bearer secreto-de-prueba"))

    expect(res.status).toBe(500)
  })
})

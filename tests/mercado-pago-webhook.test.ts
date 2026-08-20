import { beforeEach, describe, expect, it, vi } from "vitest"
import type { NextRequest } from "next/server"
import { PaymentStatus } from "@prisma/client"
import { MP_SUBSCRIPTION_EVENTS } from "@/lib/mercado-pago/subscription-events"

/**
 * El webhook de Mercado Pago es la única fuente de verdad de un cobro: el
 * regreso del cliente al sitio no se toma como comprobante. Lo que se fija acá
 * es que nada del cuerpo de la notificación se crea sin verificar — ni la
 * firma, ni el importe, ni el estado.
 */

const prisma = vi.hoisted(() => ({
  order: { findUnique: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
  subscription: { findUnique: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
}))

const mocks = vi.hoisted(() => {
  // La ruta compara con `instanceof`, así que el error que lanza el doble tiene
  // que ser una instancia de la misma clase que ve el módulo bajo prueba.
  class InvalidWebhookSignatureError extends Error {
    reason = "invalid"
    requestId = "req-1"
  }

  return {
    validate: vi.fn(),
    paymentGet: vi.fn(),
    getPreapproval: vi.fn(),
    getClient: vi.fn(),
    InvalidWebhookSignatureError,
  }
})

vi.mock("mercadopago", () => ({
  InvalidWebhookSignatureError: mocks.InvalidWebhookSignatureError,
  WebhookSignatureValidator: { validate: mocks.validate },
  Payment: class {
    get = mocks.paymentGet
  },
}))

vi.mock("@/lib/mercado-pago/client", async () => {
  const { toPaymentStatus } = await import("@/lib/mercado-pago/payment-status")

  return {
    MP_WEBHOOK_SECRET: "secreto",
    getMercadoPagoClient: mocks.getClient,
    toPaymentStatus,
  }
})

vi.mock("@/lib/mercado-pago/preapproval", () => ({
  getPreapproval: mocks.getPreapproval,
}))

vi.mock("@/lib/db/db", () => ({ default: prisma }))

const { POST } = await import("@/app/api/webhooks/mercado-pago/route")

const requestWith = ({
  dataId,
  type,
  body,
}: {
  dataId?: string
  type?: string
  body?: unknown
}) =>
  ({
    nextUrl: {
      searchParams: new URLSearchParams({
        ...(dataId ? { "data.id": dataId } : {}),
        ...(type ? { type } : {}),
      }),
    },
    headers: { get: () => "firma" },
    json: async () => body ?? { type, data: { id: dataId } },
  }) as unknown as NextRequest

const paymentNotification = (dataId = "pay-1") =>
  requestWith({ dataId, type: "payment" })

const ORDER = { id: "o-1", total: 12_500, paymentStatus: PaymentStatus.PENDING }

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(console, "warn").mockImplementation(() => {})
  vi.spyOn(console, "error").mockImplementation(() => {})
  mocks.getClient.mockReturnValue({})
  mocks.validate.mockReturnValue(undefined)
  prisma.order.findUnique.mockResolvedValue(ORDER)
  prisma.order.update.mockResolvedValue({})
  prisma.subscription.update.mockResolvedValue({})
})

describe("webhook — firma y configuración", () => {
  it("rechaza una firma inválida con 401", async () => {
    mocks.validate.mockImplementation(() => {
      throw new mocks.InvalidWebhookSignatureError("firma vencida")
    })

    const res = await POST(paymentNotification())

    expect(res.status).toBe(401)
    expect(mocks.paymentGet).not.toHaveBeenCalled()
    expect(prisma.order.update).not.toHaveBeenCalled()
  })

  it("sin credenciales confirma y no hace nada", async () => {
    mocks.getClient.mockReturnValue(null)

    const res = await POST(paymentNotification())

    expect(res.status).toBe(200)
    expect(mocks.validate).not.toHaveBeenCalled()
    expect(prisma.order.update).not.toHaveBeenCalled()
  })

  it("valida la firma antes de consultar el pago", async () => {
    mocks.paymentGet.mockResolvedValue({
      status: "approved",
      external_reference: "o-1",
      transaction_amount: 12_500,
    })

    await POST(paymentNotification())

    expect(mocks.validate).toHaveBeenCalledTimes(1)
    expect(mocks.validate.mock.calls[0][0]).toMatchObject({
      dataId: "pay-1",
      secret: "secreto",
      toleranceSeconds: 300,
    })
  })
})

describe("webhook — cobro de un pedido", () => {
  it("marca pagado cuando el importe coincide", async () => {
    mocks.paymentGet.mockResolvedValue({
      status: "approved",
      external_reference: "o-1",
      transaction_amount: 12_500,
    })

    const res = await POST(paymentNotification())

    expect(res.status).toBe(200)
    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: "o-1" },
      data: { paymentStatus: PaymentStatus.PAID },
    })
  })

  it("no da por pagado un importe distinto al del pedido", async () => {
    mocks.paymentGet.mockResolvedValue({
      status: "approved",
      external_reference: "o-1",
      // Pagó 100 por un pedido de 12.500.
      transaction_amount: 100,
    })

    const res = await POST(paymentNotification())

    expect(res.status).toBe(200)
    expect(prisma.order.update).not.toHaveBeenCalled()
  })

  it("acepta un total con centavos cuando el importe es el mismo", async () => {
    // El margen de la comparación absorbe el ruido de punto flotante, no una
    // diferencia real: un total con decimales pagado exacto tiene que entrar.
    prisma.order.findUnique.mockResolvedValue({ ...ORDER, total: 12_500.1 })
    mocks.paymentGet.mockResolvedValue({
      status: "approved",
      external_reference: "o-1",
      transaction_amount: 12_500.1,
    })

    await POST(paymentNotification())

    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: "o-1" },
      data: { paymentStatus: PaymentStatus.PAID },
    })
  })

  it("no acepta un pago que viene un centavo corto", async () => {
    mocks.paymentGet.mockResolvedValue({
      status: "approved",
      external_reference: "o-1",
      transaction_amount: 12_499.99,
    })

    await POST(paymentNotification())

    expect(prisma.order.update).not.toHaveBeenCalled()
  })

  it("no confía en el estado que trae el cuerpo, relee el pago", async () => {
    mocks.paymentGet.mockResolvedValue({
      status: "rejected",
      external_reference: "o-1",
      transaction_amount: 12_500,
    })

    // El cuerpo miente diciendo que está aprobado.
    await POST(
      requestWith({
        dataId: "pay-1",
        type: "payment",
        body: { type: "payment", data: { id: "pay-1" }, status: "approved" },
      })
    )

    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: "o-1" },
      data: { paymentStatus: PaymentStatus.FAILED },
    })
  })

  it("deja pendiente un estado que no conoce", async () => {
    prisma.order.findUnique.mockResolvedValue({
      ...ORDER,
      paymentStatus: PaymentStatus.PAID,
    })
    mocks.paymentGet.mockResolvedValue({
      status: "un_estado_nuevo",
      external_reference: "o-1",
      transaction_amount: 12_500,
    })

    await POST(paymentNotification())

    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: "o-1" },
      data: { paymentStatus: PaymentStatus.PENDING },
    })
  })

  it("no reescribe un pedido que ya está en ese estado", async () => {
    prisma.order.findUnique.mockResolvedValue({
      ...ORDER,
      paymentStatus: PaymentStatus.PAID,
    })
    mocks.paymentGet.mockResolvedValue({
      status: "approved",
      external_reference: "o-1",
      transaction_amount: 12_500,
    })

    await POST(paymentNotification())

    expect(prisma.order.update).not.toHaveBeenCalled()
  })

  it("ignora un pago sin referencia al pedido", async () => {
    mocks.paymentGet.mockResolvedValue({
      status: "approved",
      transaction_amount: 12_500,
    })

    const res = await POST(paymentNotification())

    expect(res.status).toBe(200)
    expect(prisma.order.update).not.toHaveBeenCalled()
  })

  it("ignora un pago que referencia un pedido inexistente", async () => {
    prisma.order.findUnique.mockResolvedValue(null)
    mocks.paymentGet.mockResolvedValue({
      status: "approved",
      external_reference: "o-fantasma",
      transaction_amount: 12_500,
    })

    const res = await POST(paymentNotification())

    expect(res.status).toBe(200)
    expect(prisma.order.update).not.toHaveBeenCalled()
  })

  it("responde 500 ante una falla transitoria, para que reintenten", async () => {
    mocks.paymentGet.mockRejectedValue(new Error("timeout"))

    const res = await POST(paymentNotification())

    expect(res.status).toBe(500)
  })

  it("confirma y no hace nada con un tipo de evento que no maneja", async () => {
    const res = await POST(requestWith({ dataId: "x-1", type: "merchant_order" }))

    expect(res.status).toBe(200)
    expect(mocks.paymentGet).not.toHaveBeenCalled()
    expect(prisma.order.update).not.toHaveBeenCalled()
  })
})

describe("webhook — estado de la preaprobación", () => {
  const preapprovalNotification = (id = "pre-1") =>
    requestWith({ dataId: id, type: MP_SUBSCRIPTION_EVENTS.PREAPPROVAL })

  it("sigue el estado que dice Mercado Pago, no el del cuerpo", async () => {
    mocks.getPreapproval.mockResolvedValue({ status: "authorized" })
    prisma.subscription.findUnique.mockResolvedValue({ id: "s-1" })

    await POST(preapprovalNotification())

    expect(mocks.getPreapproval).toHaveBeenCalledWith("pre-1")
    expect(prisma.subscription.update).toHaveBeenCalledWith({
      where: { id: "s-1" },
      data: { preapprovalStatus: "authorized", isActive: true },
    })
  })

  it("desactiva la suscripción si el cliente la canceló en Mercado Pago", async () => {
    mocks.getPreapproval.mockResolvedValue({ status: "cancelled" })
    prisma.subscription.findUnique.mockResolvedValue({ id: "s-1" })

    await POST(preapprovalNotification())

    expect(prisma.subscription.update.mock.calls[0][0].data).toMatchObject({
      preapprovalStatus: "cancelled",
      isActive: false,
    })
  })

  it("no toca nada si la preaprobación no existe acá", async () => {
    mocks.getPreapproval.mockResolvedValue({ status: "authorized" })
    prisma.subscription.findUnique.mockResolvedValue(null)

    const res = await POST(preapprovalNotification())

    expect(res.status).toBe(200)
    expect(prisma.subscription.update).not.toHaveBeenCalled()
  })
})

describe("webhook — débito automático", () => {
  const chargeNotification = (id = "charge-1") =>
    requestWith({ dataId: id, type: MP_SUBSCRIPTION_EVENTS.AUTHORIZED_PAYMENT })

  const PENDING_ORDER = { id: "o-9", total: 12_500, notes: null }

  beforeEach(() => {
    prisma.subscription.findFirst.mockResolvedValue({
      id: "s-1",
      customerId: "c-1",
      shopId: "shop-1",
    })
    prisma.order.findFirst.mockResolvedValue(PENDING_ORDER)
  })

  it("salda el pedido pendiente cuando el importe coincide", async () => {
    mocks.paymentGet.mockResolvedValue({
      status: "approved",
      transaction_amount: 12_500,
      metadata: { preapproval_id: "pre-1" },
    })

    await POST(chargeNotification())

    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: "o-9" },
      data: { paymentStatus: "PAID", notes: null },
    })
  })

  it("cobra igual y anota la diferencia cuando el pedido cambió de precio", async () => {
    mocks.paymentGet.mockResolvedValue({
      status: "approved",
      // El monto autorizado es fijo: 10.000 contra un pedido de 12.500.
      transaction_amount: 10_000,
      metadata: { preapproval_id: "pre-1" },
    })

    await POST(chargeNotification())

    const { data } = prisma.order.update.mock.calls[0][0]
    expect(data.paymentStatus).toBe("PAID")
    expect(data.notes).toContain("2500")
  })

  it("no salda nada si el cobro no fue aprobado", async () => {
    mocks.paymentGet.mockResolvedValue({
      status: "rejected",
      transaction_amount: 12_500,
      metadata: { preapproval_id: "pre-1" },
    })

    await POST(chargeNotification())

    expect(prisma.order.update).not.toHaveBeenCalled()
  })

  it("no salda nada si no hay pedido pendiente", async () => {
    prisma.order.findFirst.mockResolvedValue(null)
    mocks.paymentGet.mockResolvedValue({
      status: "approved",
      transaction_amount: 12_500,
      metadata: { preapproval_id: "pre-1" },
    })

    const res = await POST(chargeNotification())

    expect(res.status).toBe(200)
    expect(prisma.order.update).not.toHaveBeenCalled()
  })

  it("busca solo pedidos impagos y no cancelados del cliente", async () => {
    mocks.paymentGet.mockResolvedValue({
      status: "approved",
      transaction_amount: 12_500,
      metadata: { preapproval_id: "pre-1" },
    })

    await POST(chargeNotification())

    expect(prisma.order.findFirst.mock.calls[0][0].where).toMatchObject({
      customerId: "c-1",
      shopId: "shop-1",
      paymentStatus: "PENDING",
      status: { not: "CANCELLED" },
    })
  })
})

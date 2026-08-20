import { beforeEach, describe, expect, it, vi } from "vitest"
import { DayOfWeek } from "@prisma/client"

/**
 * Pausar o cancelar una suscripción tiene que llegar a Mercado Pago **antes**
 * que a la base, y si esa llamada falla la operación se rechaza entera: borrar
 * la suscripción local sin cancelar la preaprobación dejaría al cliente
 * debitándose todas las semanas sin forma de frenarlo desde la aplicación.
 *
 * Los estados son los que espera la API de Mercado Pago, no una convención
 * nuestra, así que se afirman como los literales que se le mandan.
 */

const prisma = vi.hoisted(() => ({
  subscription: { findUnique: vi.fn(), update: vi.fn(), delete: vi.fn() },
}))

const mocks = vi.hoisted(() => ({
  verifySession: vi.fn(),
  updatePreapprovalStatus: vi.fn(),
  createPreapproval: vi.fn(),
}))

vi.mock("@/lib/db/db", () => ({ default: prisma }))
vi.mock("@/lib/auth/verify-session", () => ({
  verifySession: mocks.verifySession,
}))
vi.mock("@/lib/mercado-pago/preapproval", () => ({
  PREAPPROVAL_STATUS: {
    PENDING: "pending",
    AUTHORIZED: "authorized",
    PAUSED: "paused",
    CANCELLED: "cancelled",
  },
  updatePreapprovalStatus: mocks.updatePreapprovalStatus,
  createPreapproval: mocks.createPreapproval,
}))
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))

const { updateSubscription, deleteSubscription } = await import(
  "@/actions/subscriptions/manage-subscription"
)

const SESSION = { user: { id: "u-1" } }

const subscription = (overrides = {}) => ({
  id: "s-1",
  isActive: true,
  weekday: DayOfWeek.MONDAY,
  mercadoPagoPreapprovalId: "pre-1",
  preapprovalStatus: "authorized",
  customer: { userId: "u-1" },
  shop: { key: "viandas" },
  ...overrides,
})

/** Vitest numera cada llamada, así que sirve para afirmar el orden real. */
const ordenDe = (mock: { mock: { invocationCallOrder: number[] } }) =>
  mock.mock.invocationCallOrder[0]

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(console, "error").mockImplementation(() => {})
  mocks.verifySession.mockResolvedValue(SESSION)
  mocks.updatePreapprovalStatus.mockResolvedValue({ success: true })
  prisma.subscription.findUnique.mockResolvedValue(subscription())
  prisma.subscription.update.mockResolvedValue({})
  prisma.subscription.delete.mockResolvedValue({})
})

describe("updateSubscription — de quién es la suscripción", () => {
  it("rechaza a quien no tiene sesión", async () => {
    mocks.verifySession.mockResolvedValue(null)

    const res = await updateSubscription({
      subscriptionId: "s-1",
      isActive: false,
    })

    expect(res.error).toBeTruthy()
    expect(mocks.updatePreapprovalStatus).not.toHaveBeenCalled()
    expect(prisma.subscription.update).not.toHaveBeenCalled()
  })

  it("no deja tocar la suscripción de otro cliente", async () => {
    prisma.subscription.findUnique.mockResolvedValue(
      subscription({ customer: { userId: "OTRO-USUARIO" } })
    )

    const res = await updateSubscription({
      subscriptionId: "s-1",
      isActive: false,
    })

    expect(res.error).toBe("Suscripción no encontrada.")
    expect(mocks.updatePreapprovalStatus).not.toHaveBeenCalled()
    expect(prisma.subscription.update).not.toHaveBeenCalled()
  })
})

describe("updateSubscription — pausar y reanudar", () => {
  it("pausa primero en Mercado Pago y después acá", async () => {
    await updateSubscription({ subscriptionId: "s-1", isActive: false })

    expect(mocks.updatePreapprovalStatus).toHaveBeenCalledWith({
      preapprovalId: "pre-1",
      status: "paused",
    })
    expect(ordenDe(mocks.updatePreapprovalStatus)).toBeLessThan(
      ordenDe(prisma.subscription.update)
    )
  })

  it("si Mercado Pago falla, no se pausa nada acá", async () => {
    mocks.updatePreapprovalStatus.mockResolvedValue({
      error: "Mercado Pago no responde.",
    })

    const res = await updateSubscription({
      subscriptionId: "s-1",
      isActive: false,
    })

    expect(res.error).toBe("Mercado Pago no responde.")
    // Lo importante: la suscripción sigue activa acá, igual que allá.
    expect(prisma.subscription.update).not.toHaveBeenCalled()
  })

  it("reanudar vuelve a autorizar el débito en Mercado Pago", async () => {
    prisma.subscription.findUnique.mockResolvedValue(
      subscription({ isActive: false, preapprovalStatus: "paused" })
    )

    await updateSubscription({ subscriptionId: "s-1", isActive: true })

    expect(mocks.updatePreapprovalStatus).toHaveBeenCalledWith({
      preapprovalId: "pre-1",
      status: "authorized",
    })
  })

  it("no reanuda un débito que el cliente nunca autorizó", async () => {
    prisma.subscription.findUnique.mockResolvedValue(
      subscription({ isActive: false, preapprovalStatus: "pending" })
    )

    const res = await updateSubscription({
      subscriptionId: "s-1",
      isActive: true,
    })

    expect(res.error).toContain("autorizar el débito")
    expect(mocks.updatePreapprovalStatus).not.toHaveBeenCalled()
    expect(prisma.subscription.update).not.toHaveBeenCalled()
  })

  it("guarda el estado del débito y el de la suscripción", async () => {
    await updateSubscription({ subscriptionId: "s-1", isActive: false })

    const datos = prisma.subscription.update.mock.calls.map((c) => c[0].data)
    expect(datos).toContainEqual({ preapprovalStatus: "paused" })
    expect(datos).toContainEqual({ isActive: false, weekday: undefined })
  })
})

describe("updateSubscription — cambios que no tocan el débito", () => {
  it("cambiar el día no llama a Mercado Pago", async () => {
    await updateSubscription({
      subscriptionId: "s-1",
      weekday: DayOfWeek.FRIDAY,
    })

    expect(mocks.updatePreapprovalStatus).not.toHaveBeenCalled()
    expect(prisma.subscription.update).toHaveBeenCalledWith({
      where: { id: "s-1" },
      data: { isActive: undefined, weekday: DayOfWeek.FRIDAY },
    })
  })

  it("una suscripción sin débito automático se pausa solo acá", async () => {
    prisma.subscription.findUnique.mockResolvedValue(
      subscription({ mercadoPagoPreapprovalId: null, preapprovalStatus: null })
    )

    const res = await updateSubscription({
      subscriptionId: "s-1",
      isActive: false,
    })

    expect(res.success).toBe(true)
    expect(mocks.updatePreapprovalStatus).not.toHaveBeenCalled()
    expect(prisma.subscription.update).toHaveBeenCalledTimes(1)
  })
})

describe("deleteSubscription", () => {
  it("rechaza a quien no tiene sesión", async () => {
    mocks.verifySession.mockResolvedValue(null)

    const res = await deleteSubscription({ subscriptionId: "s-1" })

    expect(res.error).toBeTruthy()
    expect(prisma.subscription.delete).not.toHaveBeenCalled()
  })

  it("no deja borrar la suscripción de otro cliente", async () => {
    prisma.subscription.findUnique.mockResolvedValue(
      subscription({ customer: { userId: "OTRO-USUARIO" } })
    )

    const res = await deleteSubscription({ subscriptionId: "s-1" })

    expect(res.error).toBe("Suscripción no encontrada.")
    expect(mocks.updatePreapprovalStatus).not.toHaveBeenCalled()
    expect(prisma.subscription.delete).not.toHaveBeenCalled()
  })

  it("cancela el débito en Mercado Pago antes de borrar", async () => {
    await deleteSubscription({ subscriptionId: "s-1" })

    expect(mocks.updatePreapprovalStatus).toHaveBeenCalledWith({
      preapprovalId: "pre-1",
      status: "cancelled",
    })
    expect(ordenDe(mocks.updatePreapprovalStatus)).toBeLessThan(
      ordenDe(prisma.subscription.delete)
    )
  })

  it("si no se pudo cancelar el débito, la suscripción no se borra", async () => {
    mocks.updatePreapprovalStatus.mockResolvedValue({ error: "timeout" })

    const res = await deleteSubscription({ subscriptionId: "s-1" })

    expect(res.error).toContain("No pudimos cancelar el débito automático")
    // Si se borrara igual, el cliente quedaría debitándose sin forma de frenarlo.
    expect(prisma.subscription.delete).not.toHaveBeenCalled()
  })

  it("una suscripción sin débito automático se borra sin llamar a Mercado Pago", async () => {
    prisma.subscription.findUnique.mockResolvedValue(
      subscription({ mercadoPagoPreapprovalId: null })
    )

    const res = await deleteSubscription({ subscriptionId: "s-1" })

    expect(res.success).toBe(true)
    expect(mocks.updatePreapprovalStatus).not.toHaveBeenCalled()
    expect(prisma.subscription.delete).toHaveBeenCalledWith({
      where: { id: "s-1" },
    })
  })
})

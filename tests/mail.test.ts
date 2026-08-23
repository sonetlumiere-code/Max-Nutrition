import { beforeEach, describe, expect, it, vi } from "vitest"

/**
 * Contrato de los emails: los avisos nunca pueden tumbar la operación que los
 * dispara, y los críticos sí deben fallar para que el usuario se entere.
 *
 * El doble de Resend imita su comportamiento real, que es el que hace difícil
 * este contrato: la promesa **se cumple igual** cuando el envío falla, y el
 * problema viene en el campo `error` de la respuesta. Un doble que rechazara la
 * promesa estaría probando una API que Resend no tiene.
 */
const send = vi.fn()

vi.mock("resend", () => ({
  Resend: class {
    emails = { send }
  },
}))

// Las plantillas se reemplazan por dobles: acá se verifica el manejo de
// errores del envío, no el JSX, y así el test no depende de la configuración
// de transformación de Next.
vi.mock("@/components/emails/welcome-email", () => ({ default: () => null }))
vi.mock("@/components/emails/order-details-email", () => ({
  default: () => null,
}))
vi.mock("@/components/emails/order-status-email", () => ({
  default: () => null,
}))
vi.mock("@/components/emails/reset-password-email", () => ({
  default: () => null,
}))
vi.mock("@/components/emails/verification-email", () => ({
  default: () => null,
}))

// mail.ts exige esta variable al cargarse.
vi.stubEnv("RESEND_EMAIL", "pedidos@test.local")
vi.stubEnv("BASE_URL", "https://test.local")

const mail = await import("@/lib/mail/mail")

/** Lo que devuelve Resend cuando la API rechaza el envío: no lanza. */
const rechazado = {
  data: null,
  error: { name: "validation_error", message: "The domain is not verified." },
}

const aceptado = { data: { id: "re_123" }, error: null }

beforeEach(() => {
  send.mockReset()
  send.mockResolvedValue(rechazado)
})

describe("avisos: nunca lanzan", () => {
  it("el detalle del pedido devuelve false en vez de romper la compra", async () => {
    await expect(
      mail.sendOrderDetailsEmail({
        email: "cliente@test.local",
        order: { items: [], appliedPromotions: [] } as never,
        orderLink: "/foods/customer-orders-history",
      })
    ).resolves.toBe(false)

    expect(send).toHaveBeenCalledOnce()
  })

  it("la bienvenida devuelve false en vez de romper la verificación", async () => {
    await expect(
      mail.sendWelcomeEmail({
        email: "cliente@test.local",
        userName: "Ana",
      })
    ).resolves.toBe(false)
  })

  it("el cambio de estado devuelve false en vez de romper la actualización", async () => {
    await expect(
      mail.sendOrderStatusEmail({
        email: "cliente@test.local",
        customerName: "Ana",
        status: "ACCEPTED",
        shippingMethod: "DELIVERY",
        orderLink: "/foods/customer-orders-history",
      })
    ).resolves.toBe(false)
  })

  it("sin dirección de email no se intenta enviar nada", async () => {
    await expect(
      mail.sendWelcomeEmail({ email: "", userName: "Ana" })
    ).resolves.toBe(false)

    expect(send).not.toHaveBeenCalled()
  })

  it("tampoco lanzan si la promesa sí se rechaza", async () => {
    send.mockRejectedValue(new Error("Resend caído"))

    await expect(
      mail.sendWelcomeEmail({ email: "cliente@test.local", userName: "Ana" })
    ).resolves.toBe(false)
  })
})

describe("avisos: informan el envío exitoso", () => {
  it("devuelven true cuando Resend responde bien", async () => {
    send.mockResolvedValue(aceptado)

    await expect(
      mail.sendWelcomeEmail({ email: "cliente@test.local", userName: "Ana" })
    ).resolves.toBe(true)
  })

  it("no dan por enviado un mail que Resend rechazó", async () => {
    // Resend cumple la promesa igual: sin mirar `error`, esto devolvería true
    // y el fallo quedaría invisible.
    await expect(
      mail.sendOrderStatusEmail({
        email: "cliente@test.local",
        customerName: "Ana",
        status: "ACCEPTED",
        shippingMethod: "DELIVERY",
        orderLink: "/foods/customer-orders-history",
      })
    ).resolves.toBe(false)
  })
})

describe("críticos: sí propagan el error", () => {
  it("la verificación falla ruidosamente, porque el usuario necesita ese link", async () => {
    await expect(
      mail.sendVerificationEmail("cliente@test.local", "token-123")
    ).rejects.toThrow("The domain is not verified.")
  })

  it("el reseteo de contraseña también", async () => {
    await expect(
      mail.sendPasswordResetEmail("cliente@test.local", "token-123")
    ).rejects.toThrow("The domain is not verified.")
  })

  it("y también cuando la promesa se rechaza de verdad", async () => {
    send.mockRejectedValue(new Error("Resend caído"))

    await expect(
      mail.sendVerificationEmail("cliente@test.local", "token-123")
    ).rejects.toThrow("Resend caído")
  })

  it("no lanzan cuando el envío salió bien", async () => {
    send.mockResolvedValue(aceptado)

    await expect(
      mail.sendVerificationEmail("cliente@test.local", "token-123")
    ).resolves.toBeUndefined()
  })
})

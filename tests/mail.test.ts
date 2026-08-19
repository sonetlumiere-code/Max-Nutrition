import { beforeEach, describe, expect, it, vi } from "vitest"

/**
 * Contrato de los emails: los avisos nunca pueden tumbar la operación que los
 * dispara, y los críticos sí deben fallar para que el usuario se entere.
 *
 * Resend se reemplaza por un doble que falla siempre, simulando una caída del
 * proveedor.
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

beforeEach(() => {
  send.mockReset()
  send.mockRejectedValue(new Error("Resend caído"))
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
})

describe("avisos: informan el envío exitoso", () => {
  it("devuelven true cuando Resend responde bien", async () => {
    send.mockResolvedValue({ id: "re_123" })

    await expect(
      mail.sendWelcomeEmail({ email: "cliente@test.local", userName: "Ana" })
    ).resolves.toBe(true)
  })
})

describe("críticos: sí propagan el error", () => {
  it("la verificación falla ruidosamente, porque el usuario necesita ese link", async () => {
    await expect(
      mail.sendVerificationEmail("cliente@test.local", "token-123")
    ).rejects.toThrow("Resend caído")
  })

  it("el reseteo de contraseña también", async () => {
    await expect(
      mail.sendPasswordResetEmail("cliente@test.local", "token-123")
    ).rejects.toThrow("Resend caído")
  })
})

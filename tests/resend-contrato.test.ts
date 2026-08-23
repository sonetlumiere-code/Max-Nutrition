import { beforeEach, describe, expect, it, vi } from "vitest"

/**
 * Contrato con el paquete `resend`, verificado contra el cliente REAL.
 *
 * El resto de los tests de mail doblan a Resend, y ahí está el riesgo: durante
 * mucho tiempo ese doble rechazaba la promesa, imitando una API que Resend no
 * tiene, y por eso nadie vio que un envío fallado se reportaba como exitoso.
 *
 * Acá no se dobla el paquete: se dobla `fetch`, que es la frontera de verdad.
 * Si una versión futura de resend cambia cómo informa los errores, este archivo
 * falla en vez de dejarnos creyendo que los mails salen.
 */

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

vi.stubEnv("RESEND_EMAIL", "pedidos@test.local")
vi.stubEnv("RESEND_API_KEY", "re_test_key")
vi.stubEnv("BASE_URL", "https://test.local")

const mail = await import("@/lib/mail/mail")

/** Lo que contesta la API cuando el dominio no está verificado. */
const responder422 = () =>
  vi.fn(
    async () =>
      new Response(
        JSON.stringify({
          name: "validation_error",
          message: "The domain is not verified.",
        }),
        { status: 422, headers: { "Content-Type": "application/json" } }
      )
  )

const responderOk = () =>
  vi.fn(
    async () =>
      new Response(JSON.stringify({ id: "re_123" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
  )

beforeEach(() => {
  vi.unstubAllGlobals()
})

describe("cuando la API de Resend rechaza el envío", () => {
  it("la verificación de cuenta falla, aunque Resend cumpla la promesa", async () => {
    vi.stubGlobal("fetch", responder422())

    await expect(
      mail.sendVerificationEmail("cliente@test.local", "token-123")
    ).rejects.toThrow("The domain is not verified.")
  })

  it("el aviso de bienvenida informa que no se envió", async () => {
    vi.stubGlobal("fetch", responder422())

    await expect(
      mail.sendWelcomeEmail({ email: "cliente@test.local", userName: "Ana" })
    ).resolves.toBe(false)
  })

  it("una caída de red también llega por el mismo camino, no como rechazo", async () => {
    // resend atrapa el error de fetch y lo devuelve en `error`, así que sin
    // leer ese campo una caída de red pasaría por envío exitoso.
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("ECONNREFUSED")
      })
    )

    await expect(
      mail.sendPasswordResetEmail("cliente@test.local", "token-123")
    ).rejects.toThrow()
  })
})

describe("cuando el envío sale bien", () => {
  it("el crítico no lanza y el aviso informa true", async () => {
    vi.stubGlobal("fetch", responderOk())

    await expect(
      mail.sendVerificationEmail("cliente@test.local", "token-123")
    ).resolves.toBeUndefined()

    await expect(
      mail.sendWelcomeEmail({ email: "cliente@test.local", userName: "Ana" })
    ).resolves.toBe(true)
  })
})

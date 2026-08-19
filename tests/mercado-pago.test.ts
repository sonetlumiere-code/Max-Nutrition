import { createHmac } from "node:crypto"
import { describe, expect, it } from "vitest"
import { PaymentStatus } from "@prisma/client"
import {
  InvalidWebhookSignatureError,
  WebhookSignatureValidator,
} from "mercadopago"
import { toPaymentStatus } from "@/lib/mercado-pago/payment-status"

describe("toPaymentStatus", () => {
  it("solo da por cobrado un pago aprobado", () => {
    expect(toPaymentStatus("approved")).toBe(PaymentStatus.PAID)
  })

  it.each(["rejected", "cancelled", "charged_back"])(
    "marca %s como fallido",
    (status) => {
      expect(toPaymentStatus(status)).toBe(PaymentStatus.FAILED)
    }
  )

  it.each(["pending", "in_process", "in_mediation", "authorized"])(
    "deja %s pendiente",
    (status) => {
      expect(toPaymentStatus(status)).toBe(PaymentStatus.PENDING)
    }
  )

  it("ante un estado desconocido no asume que está pagado", () => {
    // Si Mercado Pago agrega un estado nuevo, el pedido queda para revisar en
    // vez de darse por cobrado.
    expect(toPaymentStatus("un_estado_nuevo")).toBe(PaymentStatus.PENDING)
    expect(toPaymentStatus(undefined)).toBe(PaymentStatus.PENDING)
    expect(toPaymentStatus(null)).toBe(PaymentStatus.PENDING)
    expect(toPaymentStatus("")).toBe(PaymentStatus.PENDING)
  })

  it("distingue mayúsculas: 'APPROVED' no es 'approved'", () => {
    expect(toPaymentStatus("APPROVED")).toBe(PaymentStatus.PENDING)
  })
})

/**
 * El webhook es un endpoint público: cualquiera puede llamarlo. Lo único que
 * distingue una notificación real de una inventada es la firma, así que vale
 * la pena fijar ese contrato por si el SDK cambia de comportamiento.
 */
describe("firma del webhook", () => {
  const SECRET = "secreto-de-prueba"
  const DATA_ID = "123456789"
  const REQUEST_ID = "req-abc"

  const sign = (
    { dataId = DATA_ID, requestId = REQUEST_ID, ts = 1_700_000_000 } = {},
    secret = SECRET
  ) => {
    const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`
    const hash = createHmac("sha256", secret).update(manifest).digest("hex")

    return { header: `ts=${ts},v1=${hash}`, ts }
  }

  const validate = (
    xSignature: string,
    { dataId = DATA_ID, requestId = REQUEST_ID, now = 1_700_000_000_000 } = {}
  ) =>
    WebhookSignatureValidator.validate({
      xSignature,
      xRequestId: requestId,
      dataId,
      secret: SECRET,
      toleranceSeconds: 300,
      now: () => now,
    })

  it("acepta una notificación firmada con el secreto correcto", () => {
    expect(() => validate(sign().header)).not.toThrow()
  })

  it("rechaza una firma inventada", () => {
    expect(() => validate("ts=1700000000,v1=deadbeef")).toThrow(
      InvalidWebhookSignatureError
    )
  })

  it("rechaza una firma hecha con otro secreto", () => {
    const { header } = sign({}, "otro-secreto")

    expect(() => validate(header)).toThrow(InvalidWebhookSignatureError)
  })

  it("rechaza si cambia el id del pago (no se puede reusar una firma)", () => {
    const { header } = sign({ dataId: "111" })

    expect(() => validate(header, { dataId: "999" })).toThrow(
      InvalidWebhookSignatureError
    )
  })

  it("rechaza una notificación vieja reenviada", () => {
    const { header } = sign({ ts: 1_700_000_000 })
    // Una hora más tarde, fuera de la tolerancia de 5 minutos.
    const unaHoraDespues = 1_700_000_000_000 + 60 * 60 * 1000

    expect(() => validate(header, { now: unaHoraDespues })).toThrow(
      InvalidWebhookSignatureError
    )
  })

  it("rechaza cuando falta el encabezado", () => {
    expect(() =>
      WebhookSignatureValidator.validate({
        xSignature: null,
        xRequestId: REQUEST_ID,
        dataId: DATA_ID,
        secret: SECRET,
      })
    ).toThrow(InvalidWebhookSignatureError)
  })
})

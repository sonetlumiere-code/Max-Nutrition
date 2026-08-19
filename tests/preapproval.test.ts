import { describe, expect, it } from "vitest"
import {
  MP_SUBSCRIPTION_EVENTS,
  classifyEvent,
  isPreapprovalActive,
  reconcileRecurringCharge,
} from "@/lib/mercado-pago/subscription-events"

describe("classifyEvent", () => {
  it("reconoce un pago suelto", () => {
    expect(classifyEvent("payment", "123")).toEqual({
      kind: "payment",
      id: "123",
    })
  })

  it("reconoce el cambio de estado de una preaprobación", () => {
    expect(classifyEvent(MP_SUBSCRIPTION_EVENTS.PREAPPROVAL, "abc")).toEqual({
      kind: "preapproval",
      id: "abc",
    })
  })

  it("reconoce el cobro de una cuota", () => {
    expect(
      classifyEvent(MP_SUBSCRIPTION_EVENTS.AUTHORIZED_PAYMENT, "xyz")
    ).toEqual({ kind: "authorized_payment", id: "xyz" })
  })

  it("ignora los eventos que no manejamos", () => {
    expect(classifyEvent("plan", "1").kind).toBe("ignored")
    expect(classifyEvent("invoice", "1").kind).toBe("ignored")
    expect(classifyEvent(null, "1").kind).toBe("ignored")
  })

  it("ignora una notificación sin id, venga del tipo que venga", () => {
    expect(classifyEvent("payment", null).kind).toBe("ignored")
    expect(classifyEvent(MP_SUBSCRIPTION_EVENTS.PREAPPROVAL, "").kind).toBe(
      "ignored"
    )
  })

  it("normaliza el id a texto", () => {
    const event = classifyEvent("payment", 123 as unknown as string)

    expect(event).toEqual({ kind: "payment", id: "123" })
  })
})

describe("isPreapprovalActive", () => {
  it("solo habilita con la autorización vigente", () => {
    expect(isPreapprovalActive("authorized")).toBe(true)
  })

  it.each(["pending", "paused", "cancelled", "suspended", "", null, undefined])(
    "no habilita con estado %s",
    (status) => {
      expect(isPreapprovalActive(status)).toBe(false)
    }
  )

  it("un estado nuevo de Mercado Pago no habilita el débito", () => {
    // Ante algo que no conocemos, se prefiere no generar pedidos.
    expect(isPreapprovalActive("un_estado_futuro")).toBe(false)
  })
})

describe("reconcileRecurringCharge", () => {
  it("da por pagado cuando el cobro coincide con el pedido", () => {
    const res = reconcileRecurringCharge({
      chargedAmount: 15000,
      orderTotal: 15000,
    })

    expect(res.shouldMarkPaid).toBe(true)
    expect(res.matches).toBe(true)
    expect(res.difference).toBe(0)
  })

  it("marca pagado igual si el pedido salió más caro, y reporta la diferencia", () => {
    // Con monto fijo el cliente paga lo que autorizó: cumplió su parte.
    const res = reconcileRecurringCharge({
      chargedAmount: 15000,
      orderTotal: 16500,
    })

    expect(res.shouldMarkPaid).toBe(true)
    expect(res.matches).toBe(false)
    expect(res.difference).toBe(1500)
  })

  it("informa diferencia negativa si el pedido salió más barato", () => {
    const res = reconcileRecurringCharge({
      chargedAmount: 15000,
      orderTotal: 14000,
    })

    expect(res.difference).toBe(-1000)
    expect(res.matches).toBe(false)
  })

  it("tolera el redondeo de un centavo", () => {
    const res = reconcileRecurringCharge({
      chargedAmount: 15000,
      orderTotal: 15000.009,
    })

    expect(res.matches).toBe(true)
  })

  it("no arrastra errores de punto flotante en la diferencia", () => {
    const res = reconcileRecurringCharge({
      chargedAmount: 0.1,
      orderTotal: 0.3,
    })

    expect(res.difference).toBe(0.2)
  })
})

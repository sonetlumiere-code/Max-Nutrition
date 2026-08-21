import { describe, expect, it } from "vitest"
import { resolveRouteAccess } from "@/lib/auth/route-access"

/**
 * Qué queda expuesto sin sesión. El middleware deja pasar sin autenticar las
 * rutas que se autentican solas —los webhooks con su firma, el cron con su
 * secreto— y protege todo lo demás. Es una lista corta y cualquier cosa que se
 * cuele en ella queda abierta a internet.
 */

const acceso = (pathname: string, method = "GET") =>
  resolveRouteAccess(pathname, method)

describe("rutas que pasan sin sesión", () => {
  it("deja pasar el webhook de Mercado Pago, que llega por POST y sin sesión", () => {
    expect(acceso("/api/webhooks/mercado-pago", "POST")).toEqual({
      kind: "bypass",
      reason: "webhook",
    })
  })

  it("deja pasar el cron de las suscripciones", () => {
    expect(acceso("/api/cron/subscriptions")).toEqual({
      kind: "bypass",
      reason: "cron",
    })
  })

  it("deja pasar las rutas de NextAuth", () => {
    expect(acceso("/api/auth/callback/google").kind).toBe("bypass")
    expect(acceso("/api/auth/session").kind).toBe("bypass")
  })

  it("deja leer las rutas públicas de la vitrina", () => {
    expect(acceso("/api/promotions")).toEqual({
      kind: "bypass",
      reason: "public-api",
    })
    expect(acceso("/api/categories").kind).toBe("bypass")
  })
})

describe("el prefijo no se estira más allá del segmento", () => {
  it("una ruta que solo empieza parecido no queda sin autenticar", () => {
    // Sin límite de segmento, `startsWith` dejaría entrar a cualquiera de estas.
    expect(acceso("/api/webhooks-internos/borrar-todo", "POST").kind).toBe(
      "protected"
    )
    expect(acceso("/api/webhooksfalso", "POST").kind).toBe("protected")
    expect(acceso("/api/cron-privado/correr", "POST").kind).toBe("protected")
    expect(acceso("/api/authorized-users").kind).toBe("protected")
  })

  it("pero sí cubre el prefijo exacto y lo que cuelga debajo", () => {
    expect(acceso("/api/webhooks", "POST").kind).toBe("bypass")
    expect(acceso("/api/webhooks/lo/que/sea", "POST").kind).toBe("bypass")
  })
})

describe("rutas que exigen sesión", () => {
  it("protege la API de pedidos", () => {
    expect(acceso("/api/orders").kind).toBe("protected")
  })

  it("protege todo el panel", () => {
    for (const ruta of [
      "/dashboard",
      "/orders",
      "/orders/create-order",
      "/production",
      "/analytics",
      "/recipes",
      "/users",
    ]) {
      expect(acceso(ruta).kind).toBe("protected")
    }
  })

  it("una ruta pública de solo lectura sigue protegida por POST", () => {
    expect(acceso("/api/promotions", "POST").kind).toBe("protected")
    expect(acceso("/api/categories", "DELETE").kind).toBe("protected")
  })

  it("una ruta que no existe también queda protegida", () => {
    // El default es exigir sesión, no dejar pasar.
    expect(acceso("/lo-que-sea").kind).toBe("protected")
  })

  it("la consulta de zonas de envío exige sesión", () => {
    // Solo se llama desde el checkout y desde el panel, las dos detrás del
    // login. Abrirla sería una decisión, no un descuido.
    expect(acceso("/api/shipping-zone/lanus").kind).toBe("protected")
  })

  it("la lista de rutas públicas se compara exacta, no por prefijo", () => {
    expect(acceso("/api/promotions").kind).toBe("bypass")
    // Una ruta dinámica no queda pública por listar el tramo de arriba.
    expect(acceso("/api/promotions/la-que-sea").kind).toBe("protected")
  })
})

describe("adónde vuelve el cliente después de entrar", () => {
  it("a la tienda desde la que venía", () => {
    expect(acceso("/foods/checkout")).toEqual({
      kind: "protected",
      baseRoute: "/foods",
    })
    expect(acceso("/bakery/customer-orders-history")).toEqual({
      kind: "protected",
      baseRoute: "/bakery",
    })
  })

  it("a la raíz si no venía de una tienda", () => {
    expect(acceso("/dashboard")).toEqual({ kind: "protected", baseRoute: "/" })
  })
})

describe("pantallas públicas y de ingreso", () => {
  it("la home y las vitrinas se ven sin sesión", () => {
    expect(acceso("/").kind).toBe("public")
    expect(acceso("/foods").kind).toBe("public")
    expect(acceso("/bakery").kind).toBe("public")
  })

  it("las pantallas de ingreso se distinguen de las públicas", () => {
    // El middleware saca de ahí a quien ya tiene sesión.
    for (const ruta of ["/login", "/signup", "/reset-password", "/new-password"]) {
      expect(acceso(ruta).kind).toBe("auth")
    }
  })

  it("la verificación de cuenta es pública, porque se abre desde el mail", () => {
    expect(acceso("/new-verification").kind).toBe("public")
  })
})

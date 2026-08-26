// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import { calculatePromotions } from "@/helpers/helpers"
import { calculateSubtotal, calculateTotal } from "@/lib/orders/pricing"

/**
 * El número que ve el cliente tiene que ser el que se le cobra.
 *
 * El servidor calcula con `lib/orders/pricing.ts`, y durante un tiempo la
 * vitrina tuvo su propia copia de la misma cuenta **sin redondear**: el carrito
 * en `cart-provider`, el subtotal dentro de `calculatePromotions` y el total en
 * `summary`. Tres fórmulas para lo mismo es tres oportunidades de que se
 * separen, y el servidor es el que manda: cualquier diferencia la ve el cliente
 * recién al confirmar.
 *
 * `10,05 × 3` es el caso barato de comprobar: en punto flotante da
 * 30.150000000000002, así que una fórmula que no redondea se delata sola.
 */

const CENTAVOS = 10.05

const item = (price: number, quantity: number, id = "p1") => ({
  id,
  quantity,
  product: { id, price, categories: [] },
})

vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: null, status: "unauthenticated" }),
}))

afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe("el carrito de la vitrina", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("redondea el subtotal igual que el servidor", async () => {
    localStorage.setItem(
      "cart_guest_FOOD",
      JSON.stringify([item(CENTAVOS, 3)])
    )

    const { CartProvider, useCart } = await import("@/components/cart-provider")

    const Mostrador = () => {
      const { getSubtotalPrice } = useCart()
      return <span data-testid='subtotal'>{getSubtotalPrice()}</span>
    }

    render(
      <CartProvider shop={{ shopCategory: "FOOD" } as never}>
        <Mostrador />
      </CartProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId("subtotal").textContent).toBe("30.15")
    })

    // Y no el 30.150000000000002 que sale de sumar sin redondear.
    expect(screen.getByTestId("subtotal").textContent).not.toContain(
      "30.1500000"
    )
  })
})

describe("las promociones devuelven importes ya redondeados", () => {
  it("el subtotal sale con dos decimales, no con la cola del flotante", () => {
    const resultado = calculatePromotions({
      items: [item(CENTAVOS, 3)] as never,
      promotions: [],
    })

    expect(resultado.subtotalPrice).toBe(30.15)
    expect(resultado.finalPrice).toBe(30.15)
  })

  it("coincide con lo que calcula el servidor para el mismo carrito", () => {
    const items = [item(CENTAVOS, 3), item(19.99, 7, "p2")]

    const vitrina = calculatePromotions({ items: items as never, promotions: [] })
    const servidor = calculateSubtotal(items)

    expect(vitrina.subtotalPrice).toBe(servidor)
  })
})

describe("el total con envío", () => {
  it("se arma con la misma función que usa el pedido", () => {
    // Lo que muestra `summary` y lo que guarda `createOrder` salen de acá.
    const finalPrice = calculatePromotions({
      items: [item(CENTAVOS, 3)] as never,
      promotions: [],
    }).finalPrice

    expect(calculateTotal(finalPrice, 1500.45)).toBe(1530.6)
  })

  it("el envío se suma después del descuento, no antes", () => {
    const items = [item(100, 2)]
    const subtotal = calculateSubtotal(items)
    const envio = 500

    // Un descuento fijo de 50 sobre 200: el envío no se descuenta.
    expect(calculateTotal(subtotal - 50, envio)).toBe(650)
  })
})

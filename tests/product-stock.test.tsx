// @vitest-environment jsdom

import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import type { Product } from "@prisma/client"

/**
 * Un producto sin stock se ve como tal y no se puede comprar.
 *
 * El servidor ya rechaza el pedido —eso está cubierto en create-order— pero
 * esta es la mitad que el cliente ve: si el botón siguiera habilitado, el
 * cliente armaría el carrito y recién se enteraría al confirmar.
 */

const addItem = vi.hoisted(() => vi.fn())

vi.mock("@/components/cart-provider", () => ({
  useCart: () => ({ addItem }),
}))

// El aviso de "agregado al carrito" no aporta nada acá y arrastra estado global.
vi.mock("@/components/ui/use-toast", () => ({ toast: vi.fn() }))

const ProductCard = (await import("@/components/shop/products/product-card"))
  .default
const DialogProductDetail = (
  await import("@/components/shop/products/dialog-product-detail")
).default
const DrawerProductDetail = (
  await import("@/components/shop/products/drawer-product-detail")
).default

const product = (overrides: Partial<Product> = {}) =>
  ({
    id: "p-1",
    name: "Milanesa con puré",
    description: "Vianda sin TACC",
    price: 5000,
    promotionalPrice: 5000,
    image: "",
    stock: true,
    show: true,
    featured: false,
    ...overrides,
  }) as Product

const EN_FALTA = product({ stock: false })

// El cajón de móvil usa `vaul`, que consulta el ancho de pantalla al montarse.
// jsdom no implementa matchMedia, así que se le da uno que dice que nada
// coincide: alcanza para que el componente monte y se pueda leer.
beforeAll(() => {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia
})

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  cleanup()
})

describe("la tarjeta del producto avisa la falta de stock", () => {
  it("muestra el cartel cuando no hay stock", () => {
    render(<ProductCard product={EN_FALTA} />)

    expect(screen.getByText("Sin stock")).toBeDefined()
  })

  it("no lo muestra cuando hay stock", () => {
    render(<ProductCard product={product()} />)

    expect(screen.queryByText("Sin stock")).toBeNull()
  })

  it("apaga la imagen del producto que no está disponible", () => {
    const { container } = render(<ProductCard product={EN_FALTA} />)

    expect(container.querySelector("img")?.className).toContain("opacity-50")
  })
})

/**
 * El detalle existe en dos variantes según el ancho de pantalla, y las dos
 * tienen que comportarse igual: es fácil arreglar una y olvidarse de la otra.
 */
const detalles = [
  { nombre: "diálogo (escritorio)", Componente: DialogProductDetail },
  { nombre: "cajón (móvil)", Componente: DrawerProductDetail },
]

describe.each(detalles)("el detalle en $nombre", ({ Componente }) => {
  const abrir = (p: Product) =>
    render(<Componente product={p} open={true} setOpen={() => {}} />)

  it("ofrece agregar al carrito cuando hay stock", () => {
    abrir(product())

    const boton = screen.getByRole("button", { name: "Agregar al carrito" })
    expect(boton.hasAttribute("disabled")).toBe(false)
  })

  it("dice Sin stock y deshabilita el botón cuando no hay", () => {
    abrir(EN_FALTA)

    const boton = screen.getByRole("button", { name: "Sin stock" })
    expect(boton.hasAttribute("disabled")).toBe(true)
  })

  it("no agrega nada al carrito aunque le hagan clic igual", () => {
    abrir(EN_FALTA)

    fireEvent.click(screen.getByRole("button", { name: "Sin stock" }))

    expect(addItem).not.toHaveBeenCalled()
  })

  it("agrega al carrito el producto disponible", () => {
    const disponible = product()
    abrir(disponible)

    fireEvent.click(screen.getByRole("button", { name: "Agregar al carrito" }))

    expect(addItem).toHaveBeenCalledTimes(1)
    const [productoAgregado, cantidad, variacion] = addItem.mock.calls[0]
    expect(productoAgregado.id).toBe(disponible.id)
    expect(cantidad).toBe(1)
    expect(variacion).toEqual({ withSalt: true })
  })
})

// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react"

/**
 * Crear y editar promoción compartían el 95% de sus líneas. Estos tests fijan lo
 * que cada pantalla hace hoy para poder unificarlas sin adivinar.
 *
 * Una promoción decide cuánto se descuenta de un pedido, así que lo que se
 * guarda mal acá se cobra mal después: las categorías de la condición, los
 * medios de pago y de envío que acepta, y el tope de aplicaciones.
 */

const createPromotion = vi.hoisted(() => vi.fn())
const editPromotion = vi.hoisted(() => vi.fn())
const push = vi.hoisted(() => vi.fn())
const toast = vi.hoisted(() => vi.fn())

vi.mock("@/actions/promotions/create-promotion", () => ({ createPromotion }))
vi.mock("@/actions/promotions/edit-promotion", () => ({ editPromotion }))
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }))
vi.mock("@/components/ui/use-toast", () => ({ toast }))

vi.mock("@/components/ui/select", async () => {
  const { selectMock } = await import("./helpers/select-mock")
  return selectMock()
})

globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as never

const categorias = [
  { id: "cat_1", name: "Viandas" },
  { id: "cat_2", name: "Postres" },
] as never[]

const promocion = {
  id: "promo_1",
  name: "2x1 viandas",
  description: "Llevando dos",
  isActive: true,
  discountType: "FIXED",
  discount: 2000,
  maxApplicableTimes: 3,
  shopCategory: "FOOD",
  categories: [{ categoryId: "cat_1", quantity: 2 }],
  allowedPaymentMethods: ["CASH"],
  allowedShippingMethods: ["DELIVERY"],
} as never

const botonCrear = () =>
  screen.getByRole("button", {
    name: /Agregar Promoción/i,
  }) as HTMLButtonElement

const botonEditar = () =>
  screen.getByRole("button", {
    name: /Editar Promoción/i,
  }) as HTMLButtonElement

beforeEach(() => {
  cleanup()
  createPromotion.mockReset()
  editPromotion.mockReset()
  push.mockReset()
  toast.mockReset()
  createPromotion.mockResolvedValue({ success: true })
  editPromotion.mockResolvedValue({ success: true })
})

const montarCrear = async () => {
  const { default: CreatePromotion } = await import(
    "@/components/dashboard/promotions/create-promotion/create-promotion"
  )
  return render(<CreatePromotion categories={categorias} />)
}

const montarEditar = async () => {
  const { default: EditPromotion } = await import(
    "@/components/dashboard/promotions/edit-promotion/edit-promotion"
  )
  return render(
    <EditPromotion promotion={promocion} categories={categorias} />
  )
}

const nombre = () => screen.getByLabelText("Nombre") as HTMLInputElement

/**
 * Una promoción nueva arranca con la condición vacía y el descuento en cero,
 * que el esquema rechaza: sin esto el formulario no llega a la acción.
 */
const completarCondicion = () => {
  // La descripción también es obligatoria y arranca vacía.
  fireEvent.change(screen.getByPlaceholderText("Descripción de la promoción"), {
    target: { value: "Promoción de prueba" },
  })
  fireEvent.change(screen.getByPlaceholderText("Valor del descuento"), {
    target: { value: "1500" },
  })
  // Solo hay dos combos: la categoría de la condición y la tienda.
  const combos = screen.getAllByRole("combobox") as HTMLSelectElement[]
  fireEvent.change(combos[0], { target: { value: "cat_1" } })
  fireEvent.change(screen.getByPlaceholderText("Cantidad"), {
    target: { value: "2" },
  })
}

describe("crear promoción", () => {
  it("arranca vacía, con una condición sin categoría", async () => {
    await montarCrear()

    expect(nombre().value).toBe("")
  })

  it("al guardar bien vuelve al listado y lo avisa", async () => {
    await montarCrear()

    fireEvent.change(nombre(), { target: { value: "3x2 postres" } })
    completarCondicion()
    fireEvent.click(botonCrear())

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/promotions")
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Nueva promoción creada" })
      )
    })
  })

  it("si la acción falla lo avisa y no navega", async () => {
    createPromotion.mockResolvedValue({ error: "Ya existe esa promoción." })
    await montarCrear()

    fireEvent.change(nombre(), { target: { value: "Repetida" } })
    completarCondicion()
    fireEvent.click(botonCrear())

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "destructive",
          title: "Error creando promoción",
          description: "Ya existe esa promoción.",
        })
      )
    })
    expect(push).not.toHaveBeenCalled()
  })
})

describe("editar promoción", () => {
  it("llega con los datos de la promoción cargados", async () => {
    await montarEditar()

    expect(nombre().value).toBe("2x1 viandas")
  })

  it("manda el id por separado de los valores", async () => {
    await montarEditar()

    fireEvent.change(nombre(), { target: { value: "2x1 viandas premium" } })
    fireEvent.click(botonEditar())

    await waitFor(() => {
      expect(editPromotion).toHaveBeenCalledWith({
        id: "promo_1",
        values: expect.objectContaining({ name: "2x1 viandas premium" }),
      })
    })
  })

  it("conserva la condición, el tope y los medios aceptados", async () => {
    await montarEditar()

    fireEvent.change(nombre(), { target: { value: "2x1" } })
    fireEvent.click(botonEditar())

    await waitFor(() => {
      expect(editPromotion).toHaveBeenCalledWith(
        expect.objectContaining({
          values: expect.objectContaining({
            // La condición: dos de la categoría de viandas.
            categories: [
              expect.objectContaining({ categoryId: "cat_1", quantity: 2 }),
            ],
            maxApplicableTimes: 3,
            allowedPaymentMethods: ["CASH"],
            allowedShippingMethods: ["DELIVERY"],
          }),
        })
      )
    })
  })

  it("al guardar bien vuelve al listado y lo avisa", async () => {
    await montarEditar()

    fireEvent.change(nombre(), { target: { value: "2x1" } })
    fireEvent.click(botonEditar())

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/promotions")
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Promoción actualizada" })
      )
    })
  })

  it("si la acción falla lo avisa y no navega", async () => {
    editPromotion.mockResolvedValue({ error: "No se pudo actualizar." })
    await montarEditar()

    fireEvent.change(nombre(), { target: { value: "2x1" } })
    fireEvent.click(botonEditar())

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "destructive",
          title: "Error actualizando promoción.",
        })
      )
    })
    expect(push).not.toHaveBeenCalled()
  })
})

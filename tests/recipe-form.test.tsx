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
 * Crear y editar receta compartían el 94% de sus líneas. Estos tests fijan lo
 * que cada pantalla hace hoy para poder unificarlas sin adivinar.
 *
 * Una receta es una lista de ingredientes con cantidades **en unidad base**, y
 * de ahí sale el costo del producto y la lista de compras. El formulario tiene
 * un array dinámico —se agregan y se sacan filas—, que es la parte que un
 * refactor puede romper sin que se note al compilar.
 */

const createRecipe = vi.hoisted(() => vi.fn())
const editRecipe = vi.hoisted(() => vi.fn())
const push = vi.hoisted(() => vi.fn())
const toast = vi.hoisted(() => vi.fn())

vi.mock("@/actions/recipes/create-recipe", () => ({ createRecipe }))
vi.mock("@/actions/recipes/edit-recipe", () => ({ editRecipe }))
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }))
vi.mock("@/components/ui/use-toast", () => ({ toast }))

// El Select de radix se abre con eventos de puntero que jsdom no implementa.
vi.mock("@/components/ui/select", async () => {
  const { selectMock } = await import("./helpers/select-mock")
  return selectMock()
})

const ingredientes = [
  {
    id: "ing_1",
    name: "Harina de arroz",
    measurement: "KILOGRAM",
    amountPerMeasurement: 1,
    price: 2500,
    waste: 0,
    carbs: 0,
    proteins: 0,
    fats: 0,
    fiber: 0,
  },
  {
    id: "ing_2",
    name: "Sal",
    measurement: "KILOGRAM",
    amountPerMeasurement: 1,
    price: 500,
    waste: 0,
    carbs: 0,
    proteins: 0,
    fats: 0,
    fiber: 0,
  },
] as never[]

const receta = {
  id: "rec_1",
  name: "Masa base",
  description: "Para tartas",
  recipeIngredients: [
    { ingredientId: "ing_1", quantity: 500, variantScope: "ALWAYS" },
    { ingredientId: "ing_2", quantity: 10, variantScope: "ONLY_WITH_SALT" },
  ],
} as never

const botonCrear = () =>
  screen.getByRole("button", { name: /Agregar Receta/i }) as HTMLButtonElement

const botonEditar = () =>
  screen.getByRole("button", { name: /Editar Receta/i }) as HTMLButtonElement

beforeEach(() => {
  cleanup()
  createRecipe.mockReset()
  editRecipe.mockReset()
  push.mockReset()
  toast.mockReset()
  createRecipe.mockResolvedValue({ success: true })
  editRecipe.mockResolvedValue({ success: true })
})

const montarCrear = async () => {
  const { default: CreateRecipe } = await import(
    "@/components/dashboard/recipes/create-recipe/create-recipe"
  )
  return render(<CreateRecipe ingredients={ingredientes} />)
}

const montarEditar = async () => {
  const { default: EditRecipe } = await import(
    "@/components/dashboard/recipes/edit-recipe/edit-recipe"
  )
  return render(<EditRecipe recipe={receta} ingredients={ingredientes} />)
}

/** Los <select> del formulario: uno de ingrediente y uno de variante por fila. */
const selects = () => screen.getAllByRole("combobox") as HTMLSelectElement[]

/**
 * La cantidad se busca por su etiqueta, no por el placeholder: es la prueba de
 * que el label está asociado al input. Durante un tiempo apuntó al div que lo
 * envolvía, así que un lector de pantalla no lo anunciaba.
 */
const cantidad = () =>
  screen.getAllByLabelText("Cantidad")[0] as HTMLInputElement

describe("crear receta", () => {
  it("arranca con una sola fila de ingrediente, vacía", async () => {
    await montarCrear()

    expect((screen.getByLabelText("Nombre") as HTMLInputElement).value).toBe("")
    // Una fila: el select de ingrediente y el de variante.
    expect(selects()).toHaveLength(2)
  })

  it("se pueden agregar y sacar filas de ingrediente", async () => {
    await montarCrear()

    fireEvent.click(screen.getByRole("button", { name: /Agregar ingrediente/i }))
    await waitFor(() => expect(selects()).toHaveLength(4))

    // El botón de sacar de la última fila.
    const quitar = screen.getAllByRole("button", { name: "" })
    fireEvent.click(quitar[quitar.length - 1])
    await waitFor(() => expect(selects()).toHaveLength(2))
  })

  it("manda nombre e ingredientes a la acción de crear", async () => {
    await montarCrear()

    fireEvent.change(screen.getByLabelText("Nombre"), {
      target: { value: "Masa de pizza" },
    })
    fireEvent.change(selects()[0], { target: { value: "ing_1" } })
    fireEvent.change(cantidad(), {
      target: { value: "300" },
    })
    fireEvent.click(botonCrear())

    await waitFor(() => {
      expect(createRecipe).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Masa de pizza",
          ingredients: [
            expect.objectContaining({ ingredientId: "ing_1", quantity: 300 }),
          ],
        })
      )
    })
  })

  it("al guardar bien vuelve al listado y lo avisa", async () => {
    await montarCrear()

    fireEvent.change(screen.getByLabelText("Nombre"), {
      target: { value: "Masa" },
    })
    fireEvent.change(selects()[0], { target: { value: "ing_1" } })
    fireEvent.change(cantidad(), {
      target: { value: "300" },
    })
    fireEvent.click(botonCrear())

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/recipes")
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Nueva receta creada" })
      )
    })
  })

  it("si la acción falla lo avisa y no navega", async () => {
    createRecipe.mockResolvedValue({ error: "Ya existe esa receta." })
    await montarCrear()

    fireEvent.change(screen.getByLabelText("Nombre"), {
      target: { value: "Repetida" },
    })
    fireEvent.change(selects()[0], { target: { value: "ing_1" } })
    fireEvent.change(cantidad(), {
      target: { value: "300" },
    })
    fireEvent.click(botonCrear())

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "destructive",
          title: "Error creando receta",
          description: "Ya existe esa receta.",
        })
      )
    })
    expect(push).not.toHaveBeenCalled()
  })
})

describe("editar receta", () => {
  it("llega con la receta y todos sus ingredientes cargados", async () => {
    await montarEditar()

    expect((screen.getByLabelText("Nombre") as HTMLInputElement).value).toBe(
      "Masa base"
    )
    // Dos ingredientes guardados: dos filas, cuatro selects.
    expect(selects()).toHaveLength(4)
  })

  it("conserva la variante de cada ingrediente, no la aplana a ALWAYS", async () => {
    await montarEditar()

    // La segunda fila es la sal, que entra solo en la variante con sal: si el
    // formulario perdiera ese dato, un pedido sin sal compraría sal igual.
    expect(selects()[3].value).toBe("ONLY_WITH_SALT")
  })

  it("manda el id por separado de los valores", async () => {
    await montarEditar()

    fireEvent.change(screen.getByLabelText("Nombre"), {
      target: { value: "Masa base mejorada" },
    })
    fireEvent.click(botonEditar())

    await waitFor(() => {
      expect(editRecipe).toHaveBeenCalledWith({
        id: "rec_1",
        values: expect.objectContaining({ name: "Masa base mejorada" }),
      })
    })
  })

  it("al guardar bien vuelve al listado y lo avisa", async () => {
    await montarEditar()

    fireEvent.change(screen.getByLabelText("Nombre"), {
      target: { value: "Otra" },
    })
    fireEvent.click(botonEditar())

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/recipes")
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Receta actualizada" })
      )
    })
  })

  it("si la acción falla lo avisa y no navega", async () => {
    editRecipe.mockResolvedValue({ error: "No se pudo actualizar." })
    await montarEditar()

    fireEvent.change(screen.getByLabelText("Nombre"), {
      target: { value: "Otra" },
    })
    fireEvent.click(botonEditar())

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "destructive",
          title: "Error actualizando receta.",
        })
      )
    })
    expect(push).not.toHaveBeenCalled()
  })
})

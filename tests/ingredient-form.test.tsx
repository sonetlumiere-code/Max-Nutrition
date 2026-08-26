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
 * Crear y editar ingrediente compartían el 86% de sus líneas. Estos tests fijan
 * lo que cada pantalla hace hoy para poder unificarlas sin adivinar.
 *
 * El precio y la merma de un ingrediente entran en el costo de cada receta, así
 * que un formulario que guarde mal no se nota en la pantalla: se nota en el
 * margen de todos los productos.
 */

const createIngredient = vi.hoisted(() => vi.fn())
const editIngredient = vi.hoisted(() => vi.fn())
const push = vi.hoisted(() => vi.fn())
const toast = vi.hoisted(() => vi.fn())

vi.mock("@/actions/ingredients/create-ingredient", () => ({ createIngredient }))
vi.mock("@/actions/ingredients/edit-ingredient", () => ({ editIngredient }))
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }))
vi.mock("@/components/ui/use-toast", () => ({ toast }))

// El Select de radix se abre con eventos de puntero que jsdom no implementa.
// Acá no se prueba ese componente sino el formulario, así que se reemplaza por
// un <select> nativo que se puede operar.
vi.mock("@/components/ui/select", () => ({
  Select: ({
    children,
    onValueChange,
    defaultValue,
  }: {
    children: React.ReactNode
    onValueChange: (v: string) => void
    defaultValue?: string
  }) => (
    <select
      aria-label='Unidad de medida'
      defaultValue={defaultValue ?? ""}
      onChange={(e) => onValueChange(e.target.value)}
    >
      <option value=''></option>
      {children}
    </select>
  ),
  SelectTrigger: () => null,
  SelectValue: () => null,
  SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectItem: ({
    value,
    children,
  }: {
    value: string
    children: React.ReactNode
  }) => <option value={value}>{children}</option>,
}))

const ingrediente = {
  id: "ing_1",
  name: "Harina de arroz",
  measurement: "KILOGRAM",
  amountPerMeasurement: 1,
  price: 2500,
  waste: 5,
  carbs: 80,
  proteins: 7,
  fats: 1,
  fiber: 2,
} as never

const botonCrear = () =>
  screen.getByRole("button", {
    name: /Agregar Ingrediente/i,
  }) as HTMLButtonElement

const botonEditar = () =>
  screen.getByRole("button", {
    name: /Editar Ingrediente/i,
  }) as HTMLButtonElement

beforeEach(() => {
  cleanup()
  createIngredient.mockReset()
  editIngredient.mockReset()
  push.mockReset()
  toast.mockReset()
  createIngredient.mockResolvedValue({ success: true })
  editIngredient.mockResolvedValue({ success: true })
})

const montarCrear = async () => {
  const { default: CreateIngredient } = await import(
    "@/components/dashboard/ingredients/create-ingredient/create-ingredient"
  )
  return render(<CreateIngredient />)
}

const montarEditar = async () => {
  const { default: EditIngredient } = await import(
    "@/components/dashboard/ingredients/edit-ingredient/edit-ingredient"
  )
  return render(<EditIngredient ingredient={ingrediente} />)
}

const cargar = (label: RegExp | string, valor: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value: valor } })

/**
 * Precio y unidad de medida: el esquema los exige y al crear no tienen un valor
 * por defecto válido —el precio arranca en 0 y el mínimo es 0,01—, así que sin
 * cargarlos el formulario no llega a llamar a la acción.
 */
const cargarMinimos = () => {
  cargar(/^Precio/, "2500")
  cargar("Unidad de medida", "KILOGRAM")
}

describe("crear ingrediente", () => {
  it("arranca vacío, con la merma en cero", async () => {
    await montarCrear()

    expect((screen.getByLabelText("Nombre") as HTMLInputElement).value).toBe("")
    expect(
      (screen.getByLabelText(/Desperdicio \/ merma/i) as HTMLInputElement).value
    ).toBe("0")
  })

  it("manda los valores cargados a la acción de crear", async () => {
    await montarCrear()

    cargar("Nombre", "Harina de mandioca")
    cargarMinimos()
    cargar(/Desperdicio \/ merma/i, "12")
    fireEvent.click(botonCrear())

    await waitFor(() => {
      expect(createIngredient).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Harina de mandioca", waste: 12 })
      )
    })
  })

  it("al guardar bien vuelve al listado y lo avisa", async () => {
    await montarCrear()

    cargar("Nombre", "Sal fina")
    cargarMinimos()
    fireEvent.click(botonCrear())

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/ingredients")
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Nuevo ingrediente creado" })
      )
    })
  })

  it("si la acción falla lo avisa y no navega", async () => {
    createIngredient.mockResolvedValue({ error: "Ya existe ese ingrediente." })
    await montarCrear()

    cargar("Nombre", "Repetido")
    cargarMinimos()
    fireEvent.click(botonCrear())

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "destructive",
          title: "Error creando ingrediente",
          description: "Ya existe ese ingrediente.",
        })
      )
    })
    expect(push).not.toHaveBeenCalled()
  })

  it("una merma por encima de 99% no se guarda", async () => {
    await montarCrear()

    cargar("Nombre", "Imposible")
    cargar(/Desperdicio \/ merma/i, "150")
    fireEvent.click(botonCrear())

    await waitFor(() => {
      expect(screen.getByText(/Porcentaje máximo 99%/i)).toBeTruthy()
    })
    expect(createIngredient).not.toHaveBeenCalled()
  })
})

describe("editar ingrediente", () => {
  it("llega con los datos del ingrediente cargados", async () => {
    await montarEditar()

    expect((screen.getByLabelText("Nombre") as HTMLInputElement).value).toBe(
      "Harina de arroz"
    )
    expect(
      (screen.getByLabelText(/Desperdicio \/ merma/i) as HTMLInputElement).value
    ).toBe("5")
  })

  it("manda el id por separado de los valores", async () => {
    await montarEditar()

    cargar("Nombre", "Harina de arroz integral")
    fireEvent.click(botonEditar())

    await waitFor(() => {
      expect(editIngredient).toHaveBeenCalledWith({
        id: "ing_1",
        values: expect.objectContaining({ name: "Harina de arroz integral" }),
      })
    })
  })

  it("al guardar bien vuelve al listado y lo avisa", async () => {
    await montarEditar()

    cargar("Nombre", "Otro nombre")
    fireEvent.click(botonEditar())

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/ingredients")
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Ingrediente actualizado" })
      )
    })
  })

  it("si la acción falla lo avisa y no navega", async () => {
    editIngredient.mockResolvedValue({ error: "No se pudo actualizar." })
    await montarEditar()

    cargar("Nombre", "Otro")
    fireEvent.click(botonEditar())

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "destructive",
          title: "Error actualizando ingrediente.",
        })
      )
    })
    expect(push).not.toHaveBeenCalled()
  })
})

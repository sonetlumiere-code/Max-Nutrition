// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"

/**
 * Los formularios de crear y editar categoría comparten el 85% de sus líneas,
 * y estos tests existen para poder unificarlos sin adivinar: fijan lo que cada
 * uno hace hoy —qué acción llama, con qué forma, qué avisa y qué dice el
 * botón— para que el refactor tenga una red.
 *
 * Son formularios del panel, que escriben en una base productiva: la
 * diferencia entre "compila" y "hace lo mismo que antes" no es chica.
 */

const createCategory = vi.hoisted(() => vi.fn())
const editCategory = vi.hoisted(() => vi.fn())
const push = vi.hoisted(() => vi.fn())
const toast = vi.hoisted(() => vi.fn())

vi.mock("@/actions/categories/create-category", () => ({ createCategory }))
vi.mock("@/actions/categories/edit-category", () => ({ editCategory }))
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }))
vi.mock("@/components/ui/use-toast", () => ({ toast }))

// El MultiSelect abre un popover de radix, que en jsdom pide APIs que no
// existen. Acá no se prueba ese componente, sino qué hace el formulario.
vi.mock("@/components/multi-select", () => ({
  MultiSelect: ({ selected }: { selected: string[] }) => (
    <div data-testid='multi-select'>{selected.join(",")}</div>
  ),
}))

const producto = (id: string, name: string) => ({ id, name }) as never

const botonCrear = () =>
  screen.getByRole("button", {
    name: /Agregar categoría/i,
  }) as HTMLButtonElement

const botonEditar = () =>
  screen.getByRole("button", { name: /Editar Categoría/i }) as HTMLButtonElement

const categoria = {
  id: "cat_1",
  name: "Viandas clásicas",
  shopCategory: "FOOD",
  products: [{ id: "p1", name: "Milanesa" }],
} as never

beforeEach(() => {
  cleanup()
  createCategory.mockReset()
  editCategory.mockReset()
  push.mockReset()
  toast.mockReset()
  createCategory.mockResolvedValue({ success: true })
  editCategory.mockResolvedValue({ success: true })
})

const montarCrear = async () => {
  const { default: CreateCategory } = await import(
    "@/components/dashboard/categories/create-category/create-category"
  )
  return render(
    <CreateCategory products={[producto("p1", "Milanesa")]} />
  )
}

const montarEditar = async () => {
  const { default: EditCategory } = await import(
    "@/components/dashboard/categories/edit-category/edit-category"
  )
  return render(
    <EditCategory
      category={categoria}
      products={[producto("p1", "Milanesa")]}
    />
  )
}

describe("crear categoría", () => {
  it("arranca vacío y ofrece agregar", async () => {
    await montarCrear()

    expect((screen.getByLabelText("Nombre") as HTMLInputElement).value).toBe("")
    expect(botonCrear().disabled).toBe(false)
  })

  it("manda el nombre cargado a la acción de crear", async () => {
    await montarCrear()

    fireEvent.change(screen.getByLabelText("Nombre"), {
      target: { value: "Pastelería sin TACC" },
    })
    fireEvent.click(botonCrear())

    await waitFor(() => {
      expect(createCategory).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Pastelería sin TACC" })
      )
    })
  })

  it("al guardar bien vuelve al listado y lo avisa", async () => {
    await montarCrear()

    fireEvent.change(screen.getByLabelText("Nombre"), {
      target: { value: "Nueva" },
    })
    fireEvent.click(botonCrear())

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/categories")
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Nueva categoría creada" })
      )
    })
  })

  it("si la acción falla lo avisa y no navega", async () => {
    createCategory.mockResolvedValue({ error: "Ya existe una categoría así." })
    await montarCrear()

    fireEvent.change(screen.getByLabelText("Nombre"), {
      target: { value: "Repetida" },
    })
    fireEvent.click(botonCrear())

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "destructive",
          title: "Error creando categoría",
          description: "Ya existe una categoría así.",
        })
      )
    })
    expect(push).not.toHaveBeenCalled()
  })

  it("sin nombre no llama a la acción", async () => {
    await montarCrear()

    fireEvent.click(botonCrear())

    await waitFor(() => {
      expect(screen.getByText(/Ingresa el nombre/i)).toBeTruthy()
    })
    expect(createCategory).not.toHaveBeenCalled()
  })
})

describe("editar categoría", () => {
  it("llega con los datos de la categoría cargados", async () => {
    await montarEditar()

    expect((screen.getByLabelText("Nombre") as HTMLInputElement).value).toBe(
      "Viandas clásicas"
    )
    // Los productos que ya tenía llegan como ids seleccionados.
    expect(screen.getByTestId("multi-select").textContent).toBe("p1")
  })

  it("el botón arranca deshabilitado hasta que el formulario se da por válido", async () => {
    await montarEditar()

    // A diferencia de crear, editar exige `isValid`. Con react-hook-form en
    // modo onSubmit eso es false en el primer render, aunque los datos que
    // vienen de la base sean válidos.
    expect(botonEditar().disabled).toBe(true)

    await waitFor(() => {
      expect(botonEditar().disabled).toBe(false)
    })
  })

  it("manda el id por separado de los valores", async () => {
    await montarEditar()

    fireEvent.change(screen.getByLabelText("Nombre"), {
      target: { value: "Viandas premium" },
    })
    await waitFor(() => expect(botonEditar().disabled).toBe(false))
    fireEvent.click(botonEditar())

    await waitFor(() => {
      expect(editCategory).toHaveBeenCalledWith({
        id: "cat_1",
        values: expect.objectContaining({ name: "Viandas premium" }),
      })
    })
  })

  it("al guardar bien vuelve al listado y lo avisa", async () => {
    await montarEditar()

    fireEvent.change(screen.getByLabelText("Nombre"), {
      target: { value: "Otro nombre" },
    })
    await waitFor(() => expect(botonEditar().disabled).toBe(false))
    fireEvent.click(botonEditar())

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/categories")
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Categoría actualizada" })
      )
    })
  })

  it("si la acción falla lo avisa y no navega", async () => {
    editCategory.mockResolvedValue({ error: "No se pudo actualizar." })
    await montarEditar()

    fireEvent.change(screen.getByLabelText("Nombre"), {
      target: { value: "Otro" },
    })
    await waitFor(() => expect(botonEditar().disabled).toBe(false))
    fireEvent.click(botonEditar())

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "destructive",
          title: "Error actualizando categoría.",
        })
      )
    })
    expect(push).not.toHaveBeenCalled()
  })
})

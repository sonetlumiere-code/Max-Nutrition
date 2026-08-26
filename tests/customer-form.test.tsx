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
 * Crear y editar cliente compartían el 94% de sus líneas. Estos tests fijan lo
 * que cada pantalla hace hoy para poder unificarlas sin adivinar.
 *
 * Un cliente puede tener varias direcciones, y cada una se guarda en campos
 * planos pero se edita como el objeto de georef. Esa ida y vuelta es la parte
 * que un refactor puede romper sin que el compilador diga nada.
 */

const createCustomer = vi.hoisted(() => vi.fn())
const editCustomer = vi.hoisted(() => vi.fn())
const push = vi.hoisted(() => vi.fn())
const toast = vi.hoisted(() => vi.fn())

vi.mock("@/actions/customer/create-customer", () => ({ createCustomer }))
vi.mock("@/actions/customer/edit-customer", () => ({ editCustomer }))
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }))
vi.mock("@/components/ui/use-toast", () => ({ toast }))

vi.mock("@/components/ui/select", async () => {
  const { selectMock } = await import("./helpers/select-mock")
  return selectMock()
})

vi.mock("swr", () => ({
  default: (url: string | null) => {
    if (!url) return { data: undefined }
    if (url.includes("/municipios"))
      return { data: { municipios: [{ id: "1", nombre: "La Matanza" }] } }
    if (url.includes("/localidades"))
      return { data: { localidades: [{ id: "1", nombre: "Ramos Mejía" }] } }
    return { data: undefined }
  },
}))

globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as never

const cliente = {
  id: "cli_1",
  name: "Ana Gómez",
  phone: 1122334455,
  birthdate: undefined,
  addresses: [
    {
      province: "Buenos Aires",
      municipality: "La Matanza",
      locality: "Ramos Mejía",
      addressStreet: "Av. Rivadavia",
      addressNumber: 1234,
      addressFloor: 3,
      addressApartment: "B",
      postCode: "1704",
      label: "HOME",
      labelString: "",
    },
  ],
} as never

const botonCrear = () =>
  screen.getByRole("button", { name: /Agregar Cliente/i }) as HTMLButtonElement

const botonEditar = () =>
  screen.getByRole("button", { name: /Editar Cliente/i }) as HTMLButtonElement

beforeEach(() => {
  cleanup()
  createCustomer.mockReset()
  editCustomer.mockReset()
  push.mockReset()
  toast.mockReset()
  createCustomer.mockResolvedValue({ success: true })
  editCustomer.mockResolvedValue({ success: true })
})

const montarCrear = async () => {
  const { default: CreateCustomer } = await import(
    "@/components/dashboard/customers/create-customer/create-customer"
  )
  return render(<CreateCustomer />)
}

const montarEditar = async () => {
  const { default: EditCustomer } = await import(
    "@/components/dashboard/customers/edit-customer/edit-customer"
  )
  return render(<EditCustomer customer={cliente} />)
}

const nombre = () =>
  screen.getByPlaceholderText("Nombre del cliente") as HTMLInputElement

/**
 * El esquema declara el teléfono opcional, pero el formulario arranca con 0 y
 * eso no es "sin teléfono": es un número que no llega al mínimo de diez
 * dígitos, así que sin cargarlo el formulario no llega a la acción.
 */
const cargarTelefono = () =>
  fireEvent.change(screen.getByPlaceholderText("Número de teléfono del cliente"), {
    target: { value: "1122334455" },
  })

describe("crear cliente", () => {
  it("arranca vacío y sin ninguna dirección", async () => {
    await montarCrear()

    expect(nombre().value).toBe("")
    // Sin direcciones cargadas no hay campos de numeración.
    expect(screen.queryAllByPlaceholderText("Numeración")).toHaveLength(0)
  })

  it("manda el nombre a la acción de crear", async () => {
    await montarCrear()

    fireEvent.change(nombre(), { target: { value: "Juan Pérez" } })
    cargarTelefono()
    fireEvent.click(botonCrear())

    await waitFor(() => {
      expect(createCustomer).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Juan Pérez" })
      )
    })
  })

  it("al guardar bien vuelve al listado y lo avisa", async () => {
    await montarCrear()

    fireEvent.change(nombre(), { target: { value: "Juan Pérez" } })
    cargarTelefono()
    fireEvent.click(botonCrear())

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/customers")
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Cliente creado" })
      )
    })
  })

  it("si la acción falla lo avisa y no navega", async () => {
    createCustomer.mockResolvedValue({ error: "Ese cliente ya existe." })
    await montarCrear()

    fireEvent.change(nombre(), { target: { value: "Repetido" } })
    cargarTelefono()
    fireEvent.click(botonCrear())

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "destructive",
          title: "Error creando cliente",
          description: "Ese cliente ya existe.",
        })
      )
    })
    expect(push).not.toHaveBeenCalled()
  })
})

describe("editar cliente", () => {
  it("llega con el nombre y su dirección cargados", async () => {
    await montarEditar()

    expect(nombre().value).toBe("Ana Gómez")
    // La dirección guardada aparece como una fila editable.
    expect(
      screen.queryAllByPlaceholderText("Numeración").length
    ).toBeGreaterThan(0)
  })

  it("manda el id por separado de los valores", async () => {
    await montarEditar()

    fireEvent.change(nombre(), { target: { value: "Ana Gómez Pérez" } })
    fireEvent.click(botonEditar())

    await waitFor(() => {
      expect(editCustomer).toHaveBeenCalledWith({
        id: "cli_1",
        values: expect.objectContaining({ name: "Ana Gómez Pérez" }),
      })
    })
  })

  it("conserva la dirección guardada al enviar", async () => {
    await montarEditar()

    fireEvent.change(nombre(), { target: { value: "Ana G." } })
    fireEvent.click(botonEditar())

    await waitFor(() => {
      expect(editCustomer).toHaveBeenCalledWith(
        expect.objectContaining({
          values: expect.objectContaining({
            addresses: [
              expect.objectContaining({
                addressNumber: 1234,
                locality: "Ramos Mejía",
              }),
            ],
          }),
        })
      )
    })
  })

  it("al guardar bien vuelve al listado y lo avisa", async () => {
    await montarEditar()

    fireEvent.change(nombre(), { target: { value: "Ana G." } })
    fireEvent.click(botonEditar())

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/customers")
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Cliente actualizado" })
      )
    })
  })

  it("si la acción falla lo avisa y no navega", async () => {
    editCustomer.mockResolvedValue({ error: "No se pudo actualizar." })
    await montarEditar()

    fireEvent.change(nombre(), { target: { value: "Ana G." } })
    fireEvent.click(botonEditar())

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "destructive",
          title: "Error editando cliente",
        })
      )
    })
    expect(push).not.toHaveBeenCalled()
  })
})

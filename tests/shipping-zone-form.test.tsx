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
 * Crear y editar zona de envío compartían el 92% de sus líneas. Estos tests
 * fijan lo que cada pantalla hace hoy para poder unificarlas sin adivinar.
 *
 * Una zona define cuánto cuesta el envío a una localidad y en qué horarios se
 * entrega ahí. Los siete días viajan siempre, incluso los que están vacíos:
 * perder esa forma dejaría zonas sin horario en vez de zonas cerradas ese día.
 */

const createShippingZone = vi.hoisted(() => vi.fn())
const editShippingZone = vi.hoisted(() => vi.fn())
const push = vi.hoisted(() => vi.fn())
const toast = vi.hoisted(() => vi.fn())

vi.mock("@/actions/shipping-zones/create-shipping-zone", () => ({
  createShippingZone,
}))
vi.mock("@/actions/shipping-zones/edit-shipping-zone", () => ({
  editShippingZone,
}))
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }))
vi.mock("@/components/ui/use-toast", () => ({ toast }))

vi.mock("@/components/ui/select", async () => {
  const { selectMock } = await import("./helpers/select-mock")
  return selectMock()
})

// Provincias, municipios y localidades salen de la API de georef vía SWR. Acá
// se devuelve una de cada una para poder completar el formulario sin red.
vi.mock("swr", () => ({
  default: (url: string | null) => {
    if (!url) return { data: undefined }
    if (url.includes("/provincias"))
      return { data: { provincias: [{ id: "06", nombre: "Buenos Aires" }] } }
    if (url.includes("/municipios"))
      return { data: { municipios: [{ id: "1", nombre: "La Matanza" }] } }
    if (url.includes("/localidades"))
      return { data: { localidades: [{ id: "1", nombre: "Ramos Mejía" }] } }
    return { data: undefined }
  },
}))

/** Provincia, municipalidad y localidad, que el esquema exige para guardar. */
const elegirUbicacion = async () => {
  const combos = () => screen.getAllByRole("combobox") as HTMLSelectElement[]
  fireEvent.change(combos()[0], { target: { value: "Buenos Aires" } })
  await waitFor(() => expect(combos()[1]).toBeTruthy())
  fireEvent.change(combos()[1], { target: { value: "La Matanza" } })
  await waitFor(() => expect(combos()[2]).toBeTruthy())
  fireEvent.change(combos()[2], { target: { value: "Ramos Mejía" } })
}

const zona = {
  id: "zona_1",
  province: "Buenos Aires",
  municipality: "La Matanza",
  locality: "Ramos Mejía",
  cost: 1500,
  isActive: true,
  operationalHours: [
    { dayOfWeek: "MONDAY", startTime: "09:00", endTime: "18:00" },
    { dayOfWeek: "TUESDAY", startTime: null, endTime: null },
  ],
} as never

const botonCrear = () =>
  screen.getByRole("button", {
    name: /Agregar zona de envío/i,
  }) as HTMLButtonElement

const botonEditar = () =>
  screen.getByRole("button", {
    name: /Editar zona de envío/i,
  }) as HTMLButtonElement

beforeEach(() => {
  cleanup()
  createShippingZone.mockReset()
  editShippingZone.mockReset()
  push.mockReset()
  toast.mockReset()
  createShippingZone.mockResolvedValue({ success: true })
  editShippingZone.mockResolvedValue({ success: true })
})

const montarCrear = async () => {
  const { default: CreateShippingZone } = await import(
    "@/components/dashboard/shippings/shipping-zones/create-shipping-zone/create-shipping-zone"
  )
  return render(<CreateShippingZone />)
}

const montarEditar = async () => {
  const { default: EditShippingZone } = await import(
    "@/components/dashboard/shippings/shipping-zones/edit-shipping-zone/edit-shipping-zone"
  )
  return render(<EditShippingZone shippingZone={zona} />)
}

describe("crear zona de envío", () => {
  it("arranca con los siete días de horario, vacíos", async () => {
    await montarCrear()

    // Dos campos por día: apertura y cierre.
    expect(screen.getAllByPlaceholderText("HH:MM")).toHaveLength(14)
  })

  it("arranca con el costo en cero", async () => {
    await montarCrear()

    expect(
      (screen.getByPlaceholderText("Costo en pesos") as HTMLInputElement).value
    ).toBe("0")
  })

  it("al guardar bien vuelve al listado y lo avisa", async () => {
    await montarCrear()

    await elegirUbicacion()
    fireEvent.change(screen.getByPlaceholderText("Costo en pesos"), {
      target: { value: "2000" },
    })
    fireEvent.click(botonCrear())

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/shippings")
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Nueva zona de envío creada" })
      )
    })
  })

  it("si la acción falla lo avisa y no navega", async () => {
    createShippingZone.mockResolvedValue({ error: "Esa localidad ya existe." })
    await montarCrear()

    await elegirUbicacion()
    fireEvent.change(screen.getByPlaceholderText("Costo en pesos"), {
      target: { value: "2000" },
    })
    fireEvent.click(botonCrear())

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "destructive",
          description: "Esa localidad ya existe.",
        })
      )
    })
    expect(push).not.toHaveBeenCalled()
  })
})

describe("editar zona de envío", () => {
  it("llega con el costo y los horarios guardados", async () => {
    await montarEditar()

    expect(
      (screen.getByPlaceholderText("Costo en pesos") as HTMLInputElement).value
    ).toBe("1500")

    const horas = screen.getAllByPlaceholderText("HH:MM") as HTMLInputElement[]
    expect(horas[0].value).toBe("09:00")
    expect(horas[1].value).toBe("18:00")
  })

  it("un día sin horario llega vacío, no roto", async () => {
    await montarEditar()

    // El martes está guardado con horas en null: tiene que verse vacío.
    const horas = screen.getAllByPlaceholderText("HH:MM") as HTMLInputElement[]
    expect(horas[2].value).toBe("")
    expect(horas[3].value).toBe("")
  })

  it("manda el id por separado de los valores", async () => {
    await montarEditar()

    fireEvent.change(screen.getByPlaceholderText("Costo en pesos"), {
      target: { value: "1800" },
    })
    fireEvent.click(botonEditar())

    await waitFor(() => {
      expect(editShippingZone).toHaveBeenCalledWith({
        id: "zona_1",
        values: expect.objectContaining({ cost: 1800 }),
      })
    })
  })

  it("al guardar bien vuelve al listado y lo avisa", async () => {
    await montarEditar()

    fireEvent.change(screen.getByPlaceholderText("Costo en pesos"), {
      target: { value: "1800" },
    })
    fireEvent.click(botonEditar())

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/shippings")
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Zona de envío actualizada" })
      )
    })
  })

  it("si la acción falla lo avisa y no navega", async () => {
    editShippingZone.mockResolvedValue({ error: "No se pudo actualizar." })
    await montarEditar()

    fireEvent.change(screen.getByPlaceholderText("Costo en pesos"), {
      target: { value: "1800" },
    })
    fireEvent.click(botonEditar())

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "destructive",
          description: "No se pudo actualizar.",
        })
      )
    })
    expect(push).not.toHaveBeenCalled()
  })
})

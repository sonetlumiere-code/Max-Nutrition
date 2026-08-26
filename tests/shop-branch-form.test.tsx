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
 * Crear y editar sucursal compartían el 90% de sus líneas. Estos tests fijan lo
 * que cada pantalla hace hoy para poder unificarlas sin adivinar.
 *
 * Una sucursal define adónde va a retirar el cliente y en qué horarios, así que
 * los siete días viajan siempre, igual que en las zonas de envío.
 */

const createShopBranch = vi.hoisted(() => vi.fn())
const editShopBranch = vi.hoisted(() => vi.fn())
const push = vi.hoisted(() => vi.fn())
const toast = vi.hoisted(() => vi.fn())

vi.mock("@/actions/shop-branches/create-shop-branch", () => ({
  createShopBranch,
}))
vi.mock("@/actions/shop-branches/edit-shop-branch", () => ({ editShopBranch }))
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

// jsdom no trae ResizeObserver y algún componente del formulario lo usa.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as never

const sucursal = {
  id: "suc_1",
  label: "Local Centro",
  branchType: "RETAIL",
  province: "Buenos Aires",
  municipality: "La Matanza",
  locality: "Ramos Mejía",
  // El formulario arma `addressGeoRef` con estos campos planos, y el esquema lo
  // valida entero: sin la calle, el envío falla sin mostrar ningún mensaje.
  addressStreet: "Av. Rivadavia",
  addressNumber: 1234,
  addressFloor: 0,
  addressApartment: "",
  postCode: "1704",
  phoneNumber: "1122334455",
  email: "centro@test.local",
  description: "Sucursal principal",
  isActive: true,
  operationalHours: [
    { dayOfWeek: "MONDAY", startTime: "09:00", endTime: "18:00" },
    { dayOfWeek: "TUESDAY", startTime: null, endTime: null },
  ],
} as never

const botonCrear = () =>
  screen.getByRole("button", { name: /Agregar Sucursal/i }) as HTMLButtonElement

const botonEditar = () =>
  screen.getByRole("button", { name: /Editar Sucursal/i }) as HTMLButtonElement

beforeEach(() => {
  cleanup()
  createShopBranch.mockReset()
  editShopBranch.mockReset()
  push.mockReset()
  toast.mockReset()
  createShopBranch.mockResolvedValue({ success: true })
  editShopBranch.mockResolvedValue({ success: true })
})

const montarCrear = async () => {
  const { default: CreateShopBranch } = await import(
    "@/components/dashboard/shop-branches/create-shop-branch/create-shop-branch"
  )
  return render(<CreateShopBranch />)
}

const montarEditar = async () => {
  const { default: EditShopBranch } = await import(
    "@/components/dashboard/shop-branches/edit-shop-branch/edit-shop-branch"
  )
  return render(<EditShopBranch shopBranch={sucursal} />)
}

describe("crear sucursal", () => {
  it("arranca vacía y con los siete días de horario", async () => {
    await montarCrear()

    expect(
      (
        screen.getByPlaceholderText(
          "Etiqueta de la sucursal"
        ) as HTMLInputElement
      ).value
    ).toBe("")
    expect(screen.getAllByPlaceholderText("HH:MM")).toHaveLength(14)
  })

  it("el botón dice agregar", async () => {
    await montarCrear()

    expect(botonCrear()).toBeTruthy()
  })
})

describe("editar sucursal", () => {
  it("llega con los datos de la sucursal cargados", async () => {
    await montarEditar()

    expect(
      (
        screen.getByPlaceholderText(
          "Etiqueta de la sucursal"
        ) as HTMLInputElement
      ).value
    ).toBe("Local Centro")

    const horas = screen.getAllByPlaceholderText("HH:MM") as HTMLInputElement[]
    expect(horas[0].value).toBe("09:00")
    expect(horas[1].value).toBe("18:00")
  })

  it("un día sin horario llega vacío, no roto", async () => {
    await montarEditar()

    const horas = screen.getAllByPlaceholderText("HH:MM") as HTMLInputElement[]
    expect(horas[2].value).toBe("")
    expect(horas[3].value).toBe("")
  })

  it("manda el id por separado de los valores", async () => {
    await montarEditar()

    fireEvent.change(screen.getByPlaceholderText("Etiqueta de la sucursal"), {
      target: { value: "Local Norte" },
    })
    fireEvent.click(botonEditar())

    await waitFor(() => {
      expect(editShopBranch).toHaveBeenCalledWith({
        id: "suc_1",
        values: expect.objectContaining({ label: "Local Norte" }),
      })
    })
  })

  it("al guardar bien vuelve al listado y lo avisa", async () => {
    await montarEditar()

    fireEvent.change(screen.getByPlaceholderText("Etiqueta de la sucursal"), {
      target: { value: "Local Norte" },
    })
    fireEvent.click(botonEditar())

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/shop-branches")
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Sucursal actualizada" })
      )
    })
  })

  it("si la acción falla lo avisa y no navega", async () => {
    editShopBranch.mockResolvedValue({ error: "No se pudo actualizar." })
    await montarEditar()

    fireEvent.change(screen.getByPlaceholderText("Etiqueta de la sucursal"), {
      target: { value: "Local Norte" },
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

  it("el aviso de error habla de actualizar, no de crear", async () => {
    // Antes decía "Error creando sucursal" en la pantalla de editar: el texto
    // venía copiado del otro formulario, que es exactamente lo que la
    // duplicación hace fácil de no ver.
    editShopBranch.mockResolvedValue({ error: "No se pudo actualizar." })
    await montarEditar()

    fireEvent.change(screen.getByPlaceholderText("Etiqueta de la sucursal"), {
      target: { value: "Local Norte" },
    })
    fireEvent.click(botonEditar())

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Error actualizando sucursal" })
      )
    })
  })
})

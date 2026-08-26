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
 * Crear y editar rol compartían el 89% de sus líneas. Estos tests fijan lo que
 * cada pantalla hace hoy para poder unificarlas sin adivinar.
 *
 * Los roles deciden quién puede hacer qué en el panel, así que además del
 * formulario se verifica que los permisos que ya tenía el rol lleguen
 * agrupados por sujeto, que es la parte con lógica de verdad.
 */

const createRole = vi.hoisted(() => vi.fn())
const editRole = vi.hoisted(() => vi.fn())
const push = vi.hoisted(() => vi.fn())
const toast = vi.hoisted(() => vi.fn())

vi.mock("@/actions/roles/create-role", () => ({ createRole }))
vi.mock("@/actions/roles/edit-role", () => ({ editRole }))
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }))
vi.mock("@/components/ui/use-toast", () => ({ toast }))

vi.mock("@/components/multi-select", () => ({
  MultiSelect: ({ selected }: { selected: string[] }) => (
    <div data-testid='multi-select'>{selected.join(",")}</div>
  ),
}))

const permisos = [
  { id: "perm_ver_pedidos", name: "Ver pedidos", subjectKey: "orders" },
  { id: "perm_crear_pedidos", name: "Crear pedidos", subjectKey: "orders" },
  { id: "perm_ver_productos", name: "Ver productos", subjectKey: "products" },
] as never[]

const rol = {
  id: "rol_1",
  name: "Encargado",
  permissions: [
    { id: "perm_ver_pedidos", subjectKey: "orders", name: "Ver pedidos" },
    { id: "perm_ver_productos", subjectKey: "products", name: "Ver productos" },
  ],
} as never

const botonCrear = () =>
  screen.getByRole("button", { name: /Agregar rol/i }) as HTMLButtonElement

const botonEditar = () =>
  screen.getByRole("button", { name: /Editar rol/i }) as HTMLButtonElement

beforeEach(() => {
  cleanup()
  createRole.mockReset()
  editRole.mockReset()
  push.mockReset()
  toast.mockReset()
  createRole.mockResolvedValue({ success: true })
  editRole.mockResolvedValue({ success: true })
})

const montarCrear = async () => {
  const { default: CreateRole } = await import(
    "@/components/dashboard/roles/create-role/create-role"
  )
  return render(<CreateRole permissions={permisos} />)
}

const montarEditar = async () => {
  const { default: EditRole } = await import(
    "@/components/dashboard/roles/edit-role/edit-role"
  )
  return render(<EditRole role={rol} permissions={permisos} />)
}

describe("crear rol", () => {
  it("arranca vacío y muestra un selector por cada sujeto", async () => {
    await montarCrear()

    expect((screen.getByLabelText("Nombre") as HTMLInputElement).value).toBe("")
    // Los tres permisos son de dos sujetos: pedidos y productos.
    expect(screen.getAllByTestId("multi-select")).toHaveLength(2)
  })

  it("manda el nombre a la acción de crear", async () => {
    await montarCrear()

    fireEvent.change(screen.getByLabelText("Nombre"), {
      target: { value: "Cajero" },
    })
    fireEvent.click(botonCrear())

    await waitFor(() => {
      expect(createRole).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Cajero" })
      )
    })
  })

  it("al guardar bien vuelve al listado y lo avisa", async () => {
    await montarCrear()

    fireEvent.change(screen.getByLabelText("Nombre"), {
      target: { value: "Cajero" },
    })
    fireEvent.click(botonCrear())

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/roles")
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Nuevo rol creado" })
      )
    })
  })

  it("si la acción falla lo avisa y no navega", async () => {
    createRole.mockResolvedValue({ error: "Ya existe un rol con ese nombre." })
    await montarCrear()

    fireEvent.change(screen.getByLabelText("Nombre"), {
      target: { value: "Repetido" },
    })
    fireEvent.click(botonCrear())

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "destructive",
          description: "Ya existe un rol con ese nombre.",
        })
      )
    })
    expect(push).not.toHaveBeenCalled()
  })

  it("sin nombre no llama a la acción", async () => {
    await montarCrear()

    fireEvent.click(botonCrear())

    await waitFor(() => expect(createRole).not.toHaveBeenCalled())
  })
})

describe("editar rol", () => {
  it("llega con el nombre y los permisos que ya tenía, agrupados por sujeto", async () => {
    await montarEditar()

    expect((screen.getByLabelText("Nombre") as HTMLInputElement).value).toBe(
      "Encargado"
    )

    // Un selector por sujeto, cada uno con los permisos de ese sujeto y no los
    // del otro: si se mezclaran, editar un rol le cambiaría los permisos.
    const selectores = screen.getAllByTestId("multi-select")
    expect(selectores.map((s) => s.textContent)).toEqual([
      "perm_ver_pedidos",
      "perm_ver_productos",
    ])
  })

  it("manda el id por separado de los valores", async () => {
    await montarEditar()

    fireEvent.change(screen.getByLabelText("Nombre"), {
      target: { value: "Supervisor" },
    })
    fireEvent.click(botonEditar())

    await waitFor(() => {
      expect(editRole).toHaveBeenCalledWith({
        id: "rol_1",
        values: expect.objectContaining({ name: "Supervisor" }),
      })
    })
  })

  it("al guardar bien vuelve al listado y lo avisa", async () => {
    await montarEditar()

    fireEvent.change(screen.getByLabelText("Nombre"), {
      target: { value: "Supervisor" },
    })
    fireEvent.click(botonEditar())

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/roles")
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Rol actualizado" })
      )
    })
  })

  it("si la acción falla lo avisa y no navega", async () => {
    editRole.mockResolvedValue({ error: "No se pudo actualizar." })
    await montarEditar()

    fireEvent.change(screen.getByLabelText("Nombre"), {
      target: { value: "Otro" },
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

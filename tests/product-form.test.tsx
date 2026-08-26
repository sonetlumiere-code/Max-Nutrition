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
 * Crear y editar producto compartían el 95% de sus líneas. Estos tests fijan lo
 * que cada pantalla hace hoy para poder unificarlas sin adivinar.
 *
 * Es el único par con una diferencia que no es de texto: al editar, si se sube
 * una imagen nueva, la anterior se borra de Cloudinary. Crear no tiene nada que
 * borrar. Esa asimetría es lo que hay que preservar.
 */

const createProduct = vi.hoisted(() => vi.fn())
const editProduct = vi.hoisted(() => vi.fn())
const uploadImage = vi.hoisted(() => vi.fn())
const deleteImage = vi.hoisted(() => vi.fn())
const push = vi.hoisted(() => vi.fn())
const toast = vi.hoisted(() => vi.fn())

vi.mock("@/actions/products/create-product", () => ({ createProduct }))
vi.mock("@/actions/products/edit-product", () => ({ editProduct }))
vi.mock("@/actions/cloudinary/upload-image", () => ({ default: uploadImage }))
vi.mock("@/actions/cloudinary/delete-image", () => ({ default: deleteImage }))
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }))
vi.mock("@/components/ui/use-toast", () => ({ toast }))

// El MultiSelect real abre un popover de radix. Acá alcanza con poder ver qué
// hay elegido y poder elegir: un botón por opción.
vi.mock("@/components/multi-select", () => ({
  MultiSelect: ({
    options,
    selected,
    onChange,
  }: {
    options: { value: string; label: string }[]
    selected: string[]
    onChange: (v: string[]) => void
  }) => (
    <div data-testid='multi-select'>
      <span data-testid='seleccionados'>{selected?.join(",")}</span>
      {options?.map((o) => (
        <button
          key={o.value}
          type='button'
          onClick={() => onChange([...(selected || []), o.value])}
        >
          {o.label}
        </button>
      ))}
    </div>
  ),
}))

vi.mock("@/components/ui/select", async () => {
  const { selectMock } = await import("./helpers/select-mock")
  return selectMock()
})

globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as never

const recetas = [
  { id: "rec_1", name: "Masa base", recipeIngredients: [] },
] as never[]

const tiposDeReceta = [{ id: "tipo_1", name: "Principal" }] as never[]

const categorias = [{ id: "cat_1", name: "Viandas" }] as never[]

const producto = {
  id: "prod_1",
  name: "Milanesa con puré",
  description: "Clásica",
  price: 23000,
  promotionalPrice: 0,
  featured: false,
  stock: true,
  show: true,
  image: "carpeta/imagen_vieja",
  categories: [{ id: "cat_1", name: "Viandas" }],
  productRecipes: [{ recipeId: "rec_1", typeId: "tipo_1" }],
} as never

const botonCrear = () =>
  screen.getByRole("button", {
    name: /Agregar Producto/i,
  }) as HTMLButtonElement

const botonEditar = () =>
  screen.getByRole("button", {
    name: /Editar Producto/i,
  }) as HTMLButtonElement

beforeEach(() => {
  cleanup()
  createProduct.mockReset()
  editProduct.mockReset()
  uploadImage.mockReset()
  deleteImage.mockReset()
  push.mockReset()
  toast.mockReset()
  createProduct.mockResolvedValue({ success: true })
  editProduct.mockResolvedValue({ success: true })
  uploadImage.mockResolvedValue({ public_id: "carpeta/imagen_nueva" })
})

const montarCrear = async () => {
  const { default: CreateProduct } = await import(
    "@/components/dashboard/products/create-product/create-product"
  )
  return render(
    <CreateProduct
      recipes={recetas}
      productRecipeTypes={tiposDeReceta}
      categories={categorias}
    />
  )
}

const montarEditar = async () => {
  const { default: EditProduct } = await import(
    "@/components/dashboard/products/edit-product/edit-product"
  )
  return render(
    <EditProduct
      product={producto}
      recipes={recetas}
      productRecipeTypes={tiposDeReceta}
      categories={categorias}
    />
  )
}

const nombre = () =>
  screen.getByPlaceholderText("Nombre del producto") as HTMLInputElement

const precio = () =>
  screen.getByPlaceholderText("Precio en pesos") as HTMLInputElement

/**
 * Un producto nuevo arranca con una fila de receta vacía, que el esquema
 * rechaza: sin elegir receta y tipo el formulario no llega a la acción.
 */
const elegirCategoria = () =>
  fireEvent.click(screen.getByRole("button", { name: "Viandas" }))

const elegirReceta = () => {
  elegirCategoria()
  const combos = screen.getAllByRole("combobox") as HTMLSelectElement[]
  fireEvent.change(combos[0], { target: { value: "rec_1" } })
  fireEvent.change(combos[1], { target: { value: "tipo_1" } })
}

describe("crear producto", () => {
  it("arranca vacío y con el precio en cero", async () => {
    await montarCrear()

    expect(nombre().value).toBe("")
    expect(precio().value).toBe("0")
  })

  it("manda el nombre y el precio a la acción de crear", async () => {
    await montarCrear()

    fireEvent.change(nombre(), { target: { value: "Tarta de verdura" } })
    fireEvent.change(precio(), { target: { value: "19000" } })
    elegirReceta()
    fireEvent.click(botonCrear())

    await waitFor(() => {
      expect(createProduct).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Tarta de verdura", price: 19000 })
      )
    })
  })

  it("sin imagen nueva no toca Cloudinary", async () => {
    await montarCrear()

    fireEvent.change(nombre(), { target: { value: "Tarta" } })
    fireEvent.change(precio(), { target: { value: "19000" } })
    elegirReceta()
    fireEvent.click(botonCrear())

    await waitFor(() => expect(createProduct).toHaveBeenCalled())
    expect(uploadImage).not.toHaveBeenCalled()
    expect(deleteImage).not.toHaveBeenCalled()
  })

  it("al guardar bien vuelve al listado y lo avisa", async () => {
    await montarCrear()

    fireEvent.change(nombre(), { target: { value: "Tarta" } })
    fireEvent.change(precio(), { target: { value: "19000" } })
    elegirReceta()
    fireEvent.click(botonCrear())

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/products")
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Nuevo producto creado" })
      )
    })
  })

  it("si la acción falla lo avisa y no navega", async () => {
    createProduct.mockResolvedValue({ error: "Ya existe ese producto." })
    await montarCrear()

    fireEvent.change(nombre(), { target: { value: "Repetido" } })
    fireEvent.change(precio(), { target: { value: "19000" } })
    elegirReceta()
    fireEvent.click(botonCrear())

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "destructive",
          title: "Error creando producto",
          description: "Ya existe ese producto.",
        })
      )
    })
    expect(push).not.toHaveBeenCalled()
  })
})

describe("editar producto", () => {
  it("llega con los datos del producto cargados", async () => {
    await montarEditar()

    expect(nombre().value).toBe("Milanesa con puré")
    expect(precio().value).toBe("23000")
  })

  it("manda el id por separado de los valores", async () => {
    await montarEditar()

    fireEvent.change(nombre(), { target: { value: "Milanesa napolitana" } })
    fireEvent.click(botonEditar())

    await waitFor(() => {
      expect(editProduct).toHaveBeenCalledWith({
        id: "prod_1",
        values: expect.objectContaining({ name: "Milanesa napolitana" }),
      })
    })
  })

  it("conserva las recetas y categorías que ya tenía", async () => {
    await montarEditar()

    fireEvent.change(nombre(), { target: { value: "Milanesa" } })
    fireEvent.click(botonEditar())

    await waitFor(() => {
      expect(editProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          values: expect.objectContaining({
            recipes: [
              expect.objectContaining({ recipeId: "rec_1", typeId: "tipo_1" }),
            ],
            categoriesIds: ["cat_1"],
          }),
        })
      )
    })
  })

  it("sin imagen nueva no borra la que ya tenía", async () => {
    await montarEditar()

    fireEvent.change(nombre(), { target: { value: "Milanesa" } })
    fireEvent.click(botonEditar())

    await waitFor(() => expect(editProduct).toHaveBeenCalled())
    expect(uploadImage).not.toHaveBeenCalled()
    // Lo importante: la imagen guardada sigue estando.
    expect(deleteImage).not.toHaveBeenCalled()
  })

  it("al guardar bien vuelve al listado y lo avisa", async () => {
    await montarEditar()

    fireEvent.change(nombre(), { target: { value: "Milanesa" } })
    fireEvent.click(botonEditar())

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/products")
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Producto actualizado" })
      )
    })
  })

  it("si la acción falla lo avisa y no navega", async () => {
    editProduct.mockResolvedValue({ error: "No se pudo actualizar." })
    await montarEditar()

    fireEvent.change(nombre(), { target: { value: "Milanesa" } })
    fireEvent.click(botonEditar())

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "destructive",
          title: "Error actualizando producto.",
        })
      )
    })
    expect(push).not.toHaveBeenCalled()
  })
})

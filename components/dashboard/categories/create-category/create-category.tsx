"use client"

import { createCategory } from "@/actions/categories/create-category"
import CategoryForm from "@/components/dashboard/categories/category-form"
import { PopulatedProduct } from "@/types/types"

type CreateCategoryProps = {
  products: PopulatedProduct[] | null
}

const CreateCategory = ({ products }: CreateCategoryProps) => (
  <CategoryForm
    products={products}
    defaultValues={{
      name: "",
      productsIds: [],
      promotionsIds: [],
      shopCategory: "FOOD",
    }}
    guardar={createCategory}
    textoBoton='Agregar categoría'
    avisoExito={{
      title: "Nueva categoría creada",
      description: "La categoría ha sido creada correctamente.",
    }}
    tituloError='Error creando categoría'
  />
)

export default CreateCategory

"use client"

import { editCategory } from "@/actions/categories/edit-category"
import CategoryForm from "@/components/dashboard/categories/category-form"
import { CategorySchema } from "@/lib/validations/category-validation"
import { PopulatedCategory, PopulatedProduct } from "@/types/types"

type EditCategoryProps = {
  category: PopulatedCategory
  products: PopulatedProduct[] | null
}

const EditCategory = ({ category, products }: EditCategoryProps) => (
  <CategoryForm
    products={products}
    defaultValues={{
      ...category,
      productsIds: category.products?.map((product) => product.id) || [],
    }}
    guardar={(values: CategorySchema) =>
      editCategory({ id: category.id, values })
    }
    textoBoton='Editar Categoría'
    avisoExito={{
      title: "Categoría actualizada",
      description: "La categoría se actualizó correctamente.",
    }}
    tituloError='Error actualizando categoría.'

  />
)

export default EditCategory

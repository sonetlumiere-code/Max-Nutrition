"use client"

import { createProduct } from "@/actions/products/create-product"
import ProductForm from "@/components/dashboard/products/product-form"
import { PopulatedRecipe } from "@/types/types"
import { Category, ProductRecipeType } from "@prisma/client"

type CreateProductProps = {
  recipes: PopulatedRecipe[] | null
  categories: Category[] | null
  productRecipeTypes: ProductRecipeType[] | null
}

const CreateProduct = ({
  recipes,
  categories,
  productRecipeTypes,
}: CreateProductProps) => (
  <ProductForm
    recipes={recipes}
    categories={categories}
    productRecipeTypes={productRecipeTypes}
    defaultValues={{
      name: "",
      description: "",
      price: 0,
      promotionalPrice: 0,
      featured: false,
      stock: true,
      show: true,
      image: "",
      categoriesIds: [],
      recipes: [{ recipeId: "", typeId: "" }],
    }}
    guardar={createProduct}
    titulo='Agregar Producto'
    avisoExito={{
      title: "Nuevo producto creado",
      description: "El producto ha sido creado correctamente.",
    }}
    tituloError='Error creando producto'
  />
)

export default CreateProduct

"use client"

import { editProduct } from "@/actions/products/edit-product"
import ProductForm from "@/components/dashboard/products/product-form"
import { ProductSchema } from "@/lib/validations/product-validation"
import { PopulatedProduct, PopulatedRecipe } from "@/types/types"
import { Category, ProductRecipeType } from "@prisma/client"

type EditProductProps = {
  product: PopulatedProduct
  recipes: PopulatedRecipe[] | null
  categories: Category[] | null
  productRecipeTypes: ProductRecipeType[] | null
}

const EditProduct = ({
  product,
  recipes,
  categories,
  productRecipeTypes,
}: EditProductProps) => (
  <ProductForm
    recipes={recipes}
    categories={categories}
    productRecipeTypes={productRecipeTypes}
    defaultValues={{
      ...product,
      recipes: product.productRecipes?.map(({ recipeId, typeId }) => ({
        recipeId: recipeId,
        typeId: typeId || "",
      })),
      categoriesIds: product.categories?.map((category) => category.id),
    }}
    guardar={(values: ProductSchema) =>
      editProduct({ id: product.id, values })
    }
    titulo='Editar Producto'
    avisoExito={{
      title: "Producto actualizado",
      description: "El producto se actualizó correctamente.",
    }}
    tituloError='Error actualizando producto.'
    imagenAnterior={product.image}
  />
)

export default EditProduct

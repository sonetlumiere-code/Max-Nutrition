import EditProduct from "@/components/dashboard/products/edit-product/edit-product"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { getCategories } from "@/data/categories"
import { getProductRecipeTypes } from "@/data/product-recipe-types"
import { getProduct } from "@/data/products"
import { getRecipes } from "@/data/recipes"
import { hasPermission } from "@/helpers/helpers"
import { redirect } from "next/navigation"
import { DEFAULT_REDIRECT_DASHBOARD } from "@/routes"
import { verifySession } from "@/lib/auth/verify-session"

interface EditProductPageProps {
  params: {
    productId: string
  }
}

const EditProductPage = async ({ params }: EditProductPageProps) => {
  const session = await verifySession()
  const user = session?.user

  if (!user) {
    return redirect("/")
  }

  if (!hasPermission(user, "update:products")) {
    return redirect(DEFAULT_REDIRECT_DASHBOARD)
  }

  const { productId } = params

  const [product, recipes, categories, productRecipeTypes] = await Promise.all([
    getProduct({
      where: { id: productId },
      include: {
        categories: true,
        productRecipes: {
          include: {
            type: true,
          },
        },
      },
    }),
    getRecipes({
      include: {
        recipeIngredients: {
          include: {
            ingredient: true,
          },
        },
      },
    }),
    getCategories(),
    getProductRecipeTypes(),
  ])

  if (!product) {
    return redirect(DEFAULT_REDIRECT_DASHBOARD)
  }

  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink>Inicio</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href='/products'>Productos</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Editar Producto</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <EditProduct
        product={product}
        recipes={recipes}
        categories={categories}
        productRecipeTypes={productRecipeTypes}
      />
    </>
  )
}

export default EditProductPage

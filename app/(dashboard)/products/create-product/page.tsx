import CreateProduct from "@/components/dashboard/products/create-product/create-product"
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
import { getRecipes } from "@/data/recipes"
import { hasPermission } from "@/helpers/helpers"
import { redirect } from "next/navigation"
import { DEFAULT_REDIRECT_DASHBOARD } from "@/routes"
import { verifySession } from "@/lib/auth/verify-session"

const CreateProductPage = async () => {
  const session = await verifySession()
  const user = session?.user

  if (!user) {
    return redirect("/")
  }

  if (!hasPermission(user, "create:products")) {
    return redirect(DEFAULT_REDIRECT_DASHBOARD)
  }

  const [recipes, categories, productRecipeTypes] = await Promise.all([
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
            <BreadcrumbPage>Agregar Producto</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <CreateProduct
        recipes={recipes}
        categories={categories}
        productRecipeTypes={productRecipeTypes}
      />
    </>
  )
}

export default CreateProductPage

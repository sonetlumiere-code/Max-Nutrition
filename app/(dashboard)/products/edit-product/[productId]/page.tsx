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
import { getProduct } from "@/data/products"
import { getRecipes } from "@/data/recipes"
import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"

interface EditProductPageProps {
  params: {
    productId: string
  }
}

const EditProductPage = async ({ params }: EditProductPageProps) => {
  const session = await auth()

  if (session?.user.role !== "ADMIN") {
    return redirect("/")
  }

  const { productId } = params

  const [product, recipes, categories] = await Promise.all([
    getProduct({
      where: { id: productId },
      include: { categories: true },
    }),
    getRecipes({
      include: {
        product: true,
      },
    }),
    getCategories(),
  ])

  if (!product) {
    redirect("/orders")
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
      />
    </>
  )
}

export default EditProductPage

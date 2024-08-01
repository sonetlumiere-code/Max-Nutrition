import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { redirect } from "next/navigation"
import { getProduct } from "@/data/products"
import EditProduct from "@/components/dashboard/products/edit-product/edit-product"
import { getRecipes } from "@/data/recipes"
import { getCategories } from "@/data/categories"

interface EditProductPageProps {
  params: {
    productId: string
  }
}

const EditProductPage = async ({ params }: EditProductPageProps) => {
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
    redirect("/welcome")
  }

  return (
    <div className='space-y-6'>
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

      <h2 className='font-semibold text-lg'>Editar Producto</h2>

      <EditProduct
        product={product}
        recipes={recipes}
        categories={categories}
      />
    </div>
  )
}

export default EditProductPage

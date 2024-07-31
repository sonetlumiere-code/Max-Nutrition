import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { redirect } from "next/navigation"
import { getCategory } from "@/data/categories"
import EditCategory from "@/components/dashboard/categories/edit-category/edit-category"
import { getProducts } from "@/data/products"

interface EditCategoryPageProps {
  params: {
    categoryId: string
  }
}

const EditCategoryPage = async ({ params }: EditCategoryPageProps) => {
  const { categoryId } = params

  const [category, products] = await Promise.all([
    getCategory({
      where: { id: categoryId },
      include: { products: true, promotions: true },
    }),
    getProducts(),
  ])

  if (!category) {
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
            <BreadcrumbLink href='/categories'>Categorías</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Editar Categoría</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h2 className='font-semibold text-lg'>Editar Categoría</h2>

      <EditCategory category={category} products={products} />
    </div>
  )
}

export default EditCategoryPage

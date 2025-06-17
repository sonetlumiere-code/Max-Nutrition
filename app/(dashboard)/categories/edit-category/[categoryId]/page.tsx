import EditCategory from "@/components/dashboard/categories/edit-category/edit-category"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { getCategory } from "@/data/categories"
import { getProducts } from "@/data/products"
import { hasPermission } from "@/helpers/helpers"
import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"
import { DEFAULT_REDIRECT_DASHBOARD } from "@/routes"

interface EditCategoryPageProps {
  params: {
    categoryId: string
  }
}

const EditCategoryPage = async ({ params }: EditCategoryPageProps) => {
  const session = await auth()
  const user = session?.user

  if (!user) {
    return redirect("/")
  }

  if (!hasPermission(user, "update:categories")) {
    return redirect(DEFAULT_REDIRECT_DASHBOARD)
  }

  const { categoryId } = params

  const [category, products] = await Promise.all([
    getCategory({
      where: { id: categoryId },
      include: { products: true, promotions: true },
    }),
    getProducts(),
  ])

  if (!category) {
    return redirect("/categories")
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
    </>
  )
}

export default EditCategoryPage

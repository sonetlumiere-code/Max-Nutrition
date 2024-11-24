import CreateCategory from "@/components/dashboard/categories/create-category/create-category"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { getProducts } from "@/data/products"
import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"

const CreateCategoryPage = async () => {
  const session = await auth()

  if (session?.user.role !== "ADMIN") {
    redirect("/")
  }

  const products = await getProducts()

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
            <BreadcrumbPage>Agregar Categoría</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h2 className='font-semibold text-lg'>Agregar Categoría</h2>

      <CreateCategory products={products} />
    </>
  )
}

export default CreateCategoryPage

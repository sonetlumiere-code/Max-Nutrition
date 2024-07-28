import CreateProduct from "@/components/dashboard/products/create-product/create-product"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { getRecipes } from "@/data/recipes"

const CreateProductPage = async () => {
  const recipes = await getRecipes({
    include: {
      product: true,
    },
  })

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
            <BreadcrumbPage>Agregar Producto</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h2 className='font-semibold text-lg'>Agregar Producto</h2>

      <CreateProduct recipes={recipes} />
    </div>
  )
}

export default CreateProductPage

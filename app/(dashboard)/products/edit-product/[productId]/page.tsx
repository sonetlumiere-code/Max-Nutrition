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

interface EditProductPageProps {
  params: {
    productId: string
  }
}

const EditProductPage = async ({ params }: EditProductPageProps) => {
  const { productId } = params

  const product = await getProduct({
    where: { id: productId },
  })

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

      <EditProduct product={product} />
    </div>
  )
}

export default EditProductPage

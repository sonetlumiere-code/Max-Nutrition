import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import EditShopBranch from "@/components/dashboard/shop-branches/edit-shop-branch/edit-shop-branch"
import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"
import { getShopBranch } from "@/data/shop-branches"

interface EditShopBranchProps {
  params: {
    shopBranchId: string
  }
}

const EditShopBranchPage = async ({ params }: EditShopBranchProps) => {
  const session = await auth()

  if (session?.user.role !== "ADMIN") {
    return redirect("/")
  }

  const { shopBranchId } = params

  const shopBranch = await getShopBranch({
    where: {
      id: shopBranchId,
    },
  })

  if (!shopBranch) {
    redirect("/shop-branches")
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
            <BreadcrumbLink href='/shop-branches'>Sucursales</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Editar Sucursal</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h2 className='font-semibold text-lg'>Editar Sucursal</h2>

      <EditShopBranch shopBranch={shopBranch} />
    </>
  )
}

export default EditShopBranchPage

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
import { hasPermission } from "@/helpers/helpers"
import { DEFAULT_REDIRECT_DASHBOARD } from "@/routes"

interface EditShopBranchProps {
  params: {
    shopBranchId: string
  }
}

const EditShopBranchPage = async ({ params }: EditShopBranchProps) => {
  const session = await auth()

  const user = session?.user

  if (!user) {
    return redirect("/")
  }

  if (!hasPermission(user, "update:shopBranches")) {
    return redirect(DEFAULT_REDIRECT_DASHBOARD)
  }

  const { shopBranchId } = params

  const shopBranch = await getShopBranch({
    where: {
      id: shopBranchId,
    },
    include: {
      operationalHours: true,
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

      <EditShopBranch shopBranch={shopBranch} />
    </>
  )
}

export default EditShopBranchPage

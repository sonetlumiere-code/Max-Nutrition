import CreateShopBranch from "@/components/dashboard/shop-branches/create-shop-branch/create-shop-branch"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { hasPermission } from "@/helpers/helpers"
import { redirect } from "next/navigation"
import { DEFAULT_REDIRECT_DASHBOARD } from "@/routes"
import { verifySession } from "@/lib/auth/verify-session"

const CreateShopBranchPage = async () => {
  const session = await verifySession()
  const user = session?.user

  if (!user) {
    return redirect("/")
  }

  if (!hasPermission(user, "create:shopBranches")) {
    return redirect(DEFAULT_REDIRECT_DASHBOARD)
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
            <BreadcrumbPage>Agregar Sucursal</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <CreateShopBranch />
    </>
  )
}

export default CreateShopBranchPage

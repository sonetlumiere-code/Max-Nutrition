import { getShop } from "@/data/shops"
import { hasPermission } from "@/helpers/helpers"
import { redirect } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import EditShop from "@/components/dashboard/shops/edit-shop/edit-shop"
import { DEFAULT_REDIRECT_DASHBOARD } from "@/routes"
import { verifySession } from "@/lib/auth/verify-session"

interface EditShopPageProps {
  params: {
    shopId: string
  }
}

const EditShopPage = async ({ params }: EditShopPageProps) => {
  const session = await verifySession()
  const user = session?.user

  if (!user) {
    return redirect("/")
  }

  if (!hasPermission(user, "update:shops")) {
    return redirect(DEFAULT_REDIRECT_DASHBOARD)
  }

  const { shopId } = params

  const shop = await getShop({
    where: { id: shopId },
    include: {
      operationalHours: true,
    },
  })

  if (!shop) {
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
            <BreadcrumbLink href='/shops'>Tiendas</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Editar Tienda</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <EditShop shop={shop} />
    </>
  )
}

export default EditShopPage

import CreateOrder from "@/components/dashboard/orders/create-order/create-order"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { getCategories } from "@/data/categories"
import { getCustomers } from "@/data/customer"
import { getShopBranches } from "@/data/shop-branches"
import { getShopSettings } from "@/data/shop-settings"
import { hasPermission } from "@/helpers/helpers"
import { redirect } from "next/navigation"
import { DEFAULT_REDIRECT_DASHBOARD } from "@/routes"
import { verifySession } from "@/lib/auth/verify-session"

const shopSettingsId = process.env.SHOP_SETTINGS_ID

const CreateOrderPage = async () => {
  if (!shopSettingsId) {
    return <span>Es necesario el ID de la configuración de tienda.</span>
  }

  const session = await verifySession()
  const user = session?.user

  if (!user) {
    return redirect("/")
  }

  if (!hasPermission(user, "create:orders")) {
    return redirect(DEFAULT_REDIRECT_DASHBOARD)
  }

  const [categories, customers, shopSettings, shopBranches] = await Promise.all(
    [
      getCategories({
        include: {
          products: {
            where: {
              show: true,
            },
            include: {
              categories: true,
            },
          },
          promotions: true,
        },
      }),
      getCustomers({
        include: {
          addresses: true,
        },
      }),
      getShopSettings({
        where: { id: shopSettingsId },
        include: {
          shippingSettings: true,
        },
      }),
      getShopBranches({
        where: { isActive: true },
        include: {
          operationalHours: true,
        },
      }),
    ]
  )

  if (!categories || !customers || !shopSettings || !shopBranches) {
    return <div>Error obteniendo datos</div>
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
            <BreadcrumbLink href='/orders'>Pedidos</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Crear pedido</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <CreateOrder
        categories={categories}
        customers={customers}
        shopSettings={shopSettings}
        shopBranches={shopBranches}
      />
    </>
  )
}

export default CreateOrderPage

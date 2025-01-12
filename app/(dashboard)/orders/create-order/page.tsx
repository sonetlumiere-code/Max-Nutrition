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
import { getShopSettings } from "@/data/shop-settings"

const shopSettingsId = process.env.SHOP_SETTINGS_ID

const CreateOrderPage = async () => {
  if (!shopSettingsId) {
    return <span>Es necesario el ID de la configuración de tienda.</span>
  }

  const [categories, customers, shopSettings] = await Promise.all([
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
        address: true,
      },
    }),
    getShopSettings({
      where: { id: shopSettingsId },
      include: {
        shippingSettings: true,
        branches: {
          where: { isActive: true },
          include: {
            operationalHours: true,
          },
        },
      },
    }),
  ])

  if (!categories || !customers || !shopSettings) {
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
      />
    </>
  )
}

export default CreateOrderPage

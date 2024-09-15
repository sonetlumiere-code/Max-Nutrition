import EditShopSettings from "@/components/dashboard/shop-settings/edit-shop-settings/edit-shop-settings"
import { getShopSettings } from "@/data/shop-settings"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const ShopSettings = async () => {
  const shopSettings = await getShopSettings()

  return (
    <div className='space-y-6'>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink>Inicio</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Configuración de tienda</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h2 className='font-semibold text-lg'>Configuración de tienda</h2>

      {shopSettings && <EditShopSettings shopSettings={shopSettings} />}
    </div>
  )
}

export default ShopSettings

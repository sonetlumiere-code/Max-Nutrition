import EditShopSettings from "@/components/dashboard/shop-settings/edit-shop-settings/edit-shop-settings"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { getShopSettings } from "@/data/shop-settings"
import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"

const ShopSettingsPage = async () => {
  const session = await auth()

  if (session?.user.role !== "ADMIN") {
    return redirect("/")
  }

  const settings = await getShopSettings({
    where: { id: "1" },
    include: {
      branches: {
        include: {
          operationalHours: true,
        },
      },
    },
  })

  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink>Inicio</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Configuración</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h2 className='font-semibold text-lg'>Configuración</h2>

      {settings && <EditShopSettings settings={settings} />}
    </>
  )
}

export default ShopSettingsPage

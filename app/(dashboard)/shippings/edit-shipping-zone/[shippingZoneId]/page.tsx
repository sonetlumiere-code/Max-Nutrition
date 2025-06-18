import EditShippingZone from "@/components/dashboard/shippings/shipping-zones/edit-shipping-zone/edit-shipping-zone"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { getShippingZone } from "@/data/shipping-zones"
import { hasPermission } from "@/helpers/helpers"
import { verifySession } from "@/lib/auth/verify-session"
import { DEFAULT_REDIRECT_DASHBOARD } from "@/routes"
import { redirect } from "next/navigation"

interface EditShippingZonePageProps {
  params: {
    shippingZoneId: string
  }
}

const EditShippingZonePage = async ({ params }: EditShippingZonePageProps) => {
  const session = await verifySession()
  const user = session?.user

  if (!user) {
    return redirect("/")
  }

  if (!hasPermission(user, "update:shippingZones")) {
    return redirect(DEFAULT_REDIRECT_DASHBOARD)
  }

  const { shippingZoneId } = params

  const shippingZone = await getShippingZone({
    where: { id: shippingZoneId },
    include: { operationalHours: true },
  })

  if (!shippingZone) {
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
            <BreadcrumbLink href='/shippings'>Envíos</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Editar Zona de envío</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <EditShippingZone shippingZone={shippingZone} />
    </>
  )
}

export default EditShippingZonePage

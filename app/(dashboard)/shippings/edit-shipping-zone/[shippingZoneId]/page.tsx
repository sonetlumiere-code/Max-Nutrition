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
import { redirect } from "next/navigation"

interface EditShippingZonePageProps {
  params: {
    shippingZoneId: string
  }
}

const EditShippingZonePage = async ({ params }: EditShippingZonePageProps) => {
  const { shippingZoneId } = params

  const shippingZone = await getShippingZone({ where: { id: shippingZoneId } })

  if (!shippingZone) {
    redirect("/welcome")
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

      <h2 className='font-semibold text-lg'>Editar Zona de envío</h2>

      <EditShippingZone shippingZone={shippingZone} />
    </>
  )
}

export default EditShippingZonePage

"use client"

import { editShippingZone } from "@/actions/shipping-zones/edit-shipping-zone"
import ShippingZoneForm from "@/components/dashboard/shippings/shipping-zones/shipping-zone-form"
import { ShippingZoneSchema } from "@/lib/validations/shipping-zone-validation"
import { PopulatedShippingZone } from "@/types/types"

type EditShippingZoneProps = {
  shippingZone: PopulatedShippingZone
}

const EditShippingZone = ({ shippingZone }: EditShippingZoneProps) => (
  <ShippingZoneForm
    defaultValues={{
      province: shippingZone.province,
      municipality: shippingZone.municipality,
      locality: shippingZone.locality,
      cost: shippingZone.cost,
      isActive: shippingZone.isActive,
      operationalHours: shippingZone.operationalHours?.map((hour) => ({
        dayOfWeek: hour.dayOfWeek,
        startTime: hour.startTime || undefined,
        endTime: hour.endTime || undefined,
      })),
    }}
    guardar={(values: ShippingZoneSchema) =>
      editShippingZone({ id: shippingZone.id, values })
    }
    titulo='Editar Zona de Envío'
    avisoExito={{
      title: "Zona de envío actualizada",
      description: "La zona de envío se actualizó correctamente.",
    }}
    tituloError='Error actualizando zona de envío'
  />
)

export default EditShippingZone

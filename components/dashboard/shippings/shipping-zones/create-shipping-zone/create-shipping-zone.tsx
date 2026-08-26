"use client"

import { createShippingZone } from "@/actions/shipping-zones/create-shipping-zone"
import ShippingZoneForm from "@/components/dashboard/shippings/shipping-zones/shipping-zone-form"
import { DayOfWeek } from "@prisma/client"

/** Los siete días arrancan presentes y vacíos: una zona nueva no abre ninguno. */
const defaultOperationalHours = [
  { dayOfWeek: DayOfWeek.MONDAY, startTime: "", endTime: "" },
  { dayOfWeek: DayOfWeek.TUESDAY, startTime: "", endTime: "" },
  { dayOfWeek: DayOfWeek.WEDNESDAY, startTime: "", endTime: "" },
  { dayOfWeek: DayOfWeek.THURSDAY, startTime: "", endTime: "" },
  { dayOfWeek: DayOfWeek.FRIDAY, startTime: "", endTime: "" },
  { dayOfWeek: DayOfWeek.SATURDAY, startTime: "", endTime: "" },
  { dayOfWeek: DayOfWeek.SUNDAY, startTime: "", endTime: "" },
]

const CreateShippingZone = () => (
  <ShippingZoneForm
    defaultValues={{
      province: "",
      municipality: "",
      locality: "",
      cost: 0,
      isActive: true,
      operationalHours: defaultOperationalHours,
    }}
    guardar={createShippingZone}
    titulo='Agregar Zona de Envío'
    avisoExito={{
      title: "Nueva zona de envío creada",
      description: "La zona de envío ha sido creada correctamente.",
    }}
    tituloError='Error creando zona de envío'
  />
)

export default CreateShippingZone

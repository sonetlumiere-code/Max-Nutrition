"use client"

import { createShopBranch } from "@/actions/shop-branches/create-shop-branch"
import ShopBranchForm from "@/components/dashboard/shop-branches/shop-branch-form"
import { BranchType, DayOfWeek } from "@prisma/client"

/** Los siete días arrancan presentes y vacíos: una sucursal nueva no abre ninguno. */
const defaultOperationalHours = [
  { dayOfWeek: DayOfWeek.MONDAY, startTime: "", endTime: "" },
  { dayOfWeek: DayOfWeek.TUESDAY, startTime: "", endTime: "" },
  { dayOfWeek: DayOfWeek.WEDNESDAY, startTime: "", endTime: "" },
  { dayOfWeek: DayOfWeek.THURSDAY, startTime: "", endTime: "" },
  { dayOfWeek: DayOfWeek.FRIDAY, startTime: "", endTime: "" },
  { dayOfWeek: DayOfWeek.SATURDAY, startTime: "", endTime: "" },
  { dayOfWeek: DayOfWeek.SUNDAY, startTime: "", endTime: "" },
]

const CreateShopBranch = () => (
  <ShopBranchForm
    defaultValues={{
      label: "",
      branchType: BranchType.RETAIL,
      province: "Ciudad Autónoma de Buenos Aires",
      municipality: "",
      locality: "",
      addressGeoRef: undefined,
      addressNumber: 0,
      addressFloor: 0,
      addressApartment: "",
      postCode: "",
      phoneNumber: "",
      email: undefined,
      description: "",
      isActive: true,
      operationalHours: defaultOperationalHours,
    }}
    guardar={createShopBranch}
    titulo='Agregar Sucursal'
    avisoExito={{
      title: "Nueva sucursal creada",
      description: "La sucursal ha sido creada correctamente.",
    }}
    tituloError='Error creando sucursal'
  />
)

export default CreateShopBranch

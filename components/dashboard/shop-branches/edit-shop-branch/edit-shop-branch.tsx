"use client"

import { editShopBranch } from "@/actions/shop-branches/edit-shop-branch"
import ShopBranchForm from "@/components/dashboard/shop-branches/shop-branch-form"
import { ShopBranchSchema } from "@/lib/validations/shop-branch-validation"
import { PopulatedShopBranch } from "@/types/types"

type EditShopBranchProps = {
  shopBranch: PopulatedShopBranch
}

const EditShopBranch = ({ shopBranch }: EditShopBranchProps) => (
  <ShopBranchForm
    defaultValues={{
      label: shopBranch.label,
      branchType: shopBranch.branchType,
      province: shopBranch.province,
      municipality: shopBranch.municipality,
      locality: shopBranch.locality,
      // La dirección guardada viene en campos planos y el formulario la maneja
      // como el objeto de georef, así que se rearma acá.
      addressGeoRef: {
        altura: {
          unidad: null,
          valor: shopBranch.addressNumber,
        },
        calle: {
          categoria: undefined,
          id: "",
          nombre: shopBranch.addressStreet,
        },
        departamento: {
          id: "",
          nombre: shopBranch.municipality,
        },
        nomenclatura: "",
        provincia: {
          id: "",
          nombre: shopBranch.province,
        },
      },
      addressNumber: shopBranch.addressNumber,
      addressFloor: shopBranch.addressFloor || undefined,
      addressApartment: shopBranch.addressApartment || undefined,
      postCode: shopBranch.postCode || undefined,
      phoneNumber: shopBranch.phoneNumber || undefined,
      email: shopBranch.email || undefined,
      description: shopBranch.description || undefined,
      isActive: shopBranch.isActive,
      operationalHours: shopBranch.operationalHours?.map((hour) => ({
        dayOfWeek: hour.dayOfWeek,
        startTime: hour.startTime || undefined,
        endTime: hour.endTime || undefined,
      })),
    }}
    guardar={(values: ShopBranchSchema) =>
      editShopBranch({ id: shopBranch.id, values })
    }
    titulo='Editar Sucursal'
    avisoExito={{
      title: "Sucursal actualizada",
      description: "La sucursal se actualizó correctamente.",
    }}
    tituloError='Error actualizando sucursal'
  />
)

export default EditShopBranch

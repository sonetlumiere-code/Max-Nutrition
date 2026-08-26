"use client"

import { editCustomer } from "@/actions/customer/edit-customer"
import CustomerForm from "@/components/dashboard/customers/customer-form"
import { CustomerSchema } from "@/lib/validations/customer-validation"
import { PopulatedCustomer } from "@/types/types"

type EditCustomerProps = {
  customer: PopulatedCustomer
}

const EditCustomer = ({ customer }: EditCustomerProps) => (
  <CustomerForm
    defaultValues={{
      name: customer.name,
      phone: customer.phone || 0,
      birthdate: customer.birthdate || undefined,
      // Las direcciones se guardan en campos planos y el formulario las maneja
      // como el objeto de georef, así que se rearman una por una.
      addresses:
        customer.addresses?.map((address) => ({
          province: address.province,
          municipality: address.municipality,
          locality: address.locality,
          addressGeoRef: {
            altura: {
              unidad: null,
              valor: address.addressNumber,
            },
            calle: {
              categoria: undefined,
              id: "",
              nombre: address.addressStreet,
            },
            departamento: {
              id: "",
              nombre: address.municipality,
            },
            nomenclatura: "",
            provincia: {
              id: "",
              nombre: address.province,
            },
          },
          addressNumber: address.addressNumber,
          addressFloor: address.addressFloor || 0,
          addressApartment: address.addressApartment || "",
          postCode: address.postCode,
          label: address.label,
          labelString: address.labelString || "",
        })) || [],
    }}
    guardar={(values: CustomerSchema) =>
      editCustomer({ id: customer.id, values })
    }
    titulo='Editar Cliente'
    avisoExito={{
      title: "Cliente actualizado",
      description: "El cliente ha sido actualizado correctamente.",
    }}
    tituloError='Error editando cliente'
  />
)

export default EditCustomer

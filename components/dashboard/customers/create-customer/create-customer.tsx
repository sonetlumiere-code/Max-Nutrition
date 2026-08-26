"use client"

import { createCustomer } from "@/actions/customer/create-customer"
import CustomerForm from "@/components/dashboard/customers/customer-form"

const CreateCustomer = () => (
  <CustomerForm
    defaultValues={{
      name: "",
      phone: 0,
      birthdate: undefined,
      addresses: [],
    }}
    guardar={createCustomer}
    titulo='Agregar Cliente'
    avisoExito={{
      title: "Cliente creado",
      description: "Cliente creado correctamente.",
    }}
    tituloError='Error creando cliente'
  />
)

export default CreateCustomer

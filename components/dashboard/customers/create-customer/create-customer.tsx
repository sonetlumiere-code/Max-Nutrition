"use client"

import { createCustomer } from "@/actions/customer/create-customer"
import CustomerForm from "@/components/dashboard/customers/customer-form"

const CreateCustomer = () => (
  <CustomerForm
    defaultValues={{
      name: "",
      // Sin teléfono es `undefined`, no 0: el esquema lo declara opcional pero
      // exige diez dígitos si viene, así que arrancar en 0 volvía obligatorio
      // un campo que no lo es —y obligaba a borrar el cero para cargarlo—.
      phone: undefined,
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

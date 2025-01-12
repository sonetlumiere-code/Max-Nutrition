import EditCustomer from "@/components/dashboard/customers/edit-customer/edit-customer"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { getCustomer } from "@/data/customer"
import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"

interface EditCustomerPageProps {
  params: {
    customerId: string
  }
}

const EditCustomerPage = async ({ params }: EditCustomerPageProps) => {
  const session = await auth()

  if (session?.user.role !== "ADMIN") {
    return redirect("/")
  }

  const { customerId } = params

  const customer = await getCustomer({
    where: { id: customerId },
    include: {
      address: true,
    },
  })

  if (!customer) {
    redirect("/customers")
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
            <BreadcrumbLink href='/customers'>Clientes</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Editar Cliente</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <EditCustomer customer={customer} />
    </>
  )
}

export default EditCustomerPage

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
import { hasPermission } from "@/helpers/helpers"
import { redirect } from "next/navigation"
import { DEFAULT_REDIRECT_DASHBOARD } from "@/routes"
import { verifySession } from "@/lib/auth/verify-session"

interface EditCustomerPageProps {
  params: {
    customerId: string
  }
}

const EditCustomerPage = async ({ params }: EditCustomerPageProps) => {
  const session = await verifySession()
  const user = session?.user

  if (!user) {
    return redirect("/")
  }

  if (!hasPermission(user, "update:customers")) {
    return redirect(DEFAULT_REDIRECT_DASHBOARD)
  }

  const { customerId } = params

  const customer = await getCustomer({
    where: { id: customerId },
    include: {
      addresses: true,
    },
  })

  if (!customer) {
    return redirect("/customers")
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

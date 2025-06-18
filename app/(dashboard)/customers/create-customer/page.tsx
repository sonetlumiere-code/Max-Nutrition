import { redirect } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import CreateCustomer from "@/components/dashboard/customers/create-customer/create-customer"
import { hasPermission } from "@/helpers/helpers"
import { DEFAULT_REDIRECT_DASHBOARD } from "@/routes"
import { verifySession } from "@/lib/auth/verify-session"

const CreateCustomerPage = async () => {
  const session = await verifySession()
  const user = session?.user

  if (!user) {
    return redirect("/")
  }

  if (!hasPermission(user, "create:customers")) {
    return redirect(DEFAULT_REDIRECT_DASHBOARD)
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
            <BreadcrumbPage>Agregar Cliente</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <CreateCustomer />
    </>
  )
}

export default CreateCustomerPage

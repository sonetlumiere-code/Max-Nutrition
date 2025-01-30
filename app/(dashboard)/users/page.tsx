import { getSafeUsers } from "@/data/user"
import { getPermissionsKeys, hasPermission } from "@/helpers/helpers"
import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import UsersDataTable from "@/components/dashboard/users/list/users-data-table/users-data-table"

const UsersPage = async () => {
  const session = await auth()
  const user = session?.user

  if (!user) {
    return redirect("/")
  }

  if (!hasPermission(user, "view:users")) {
    return redirect("/welcome")
  }

  const users = await getSafeUsers({
    include: {
      role: true,
    },
  })

  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink>Inicio</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Usuarios</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className='flex items-center'>
        <h1 className='text-lg font-semibold md:text-2xl'>Usuarios</h1>
      </div>

      {users && users.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='text-xl'>Usuarios</CardTitle>
            <CardDescription>Administra los usuarios.</CardDescription>
          </CardHeader>
          <CardContent>
            <UsersDataTable users={users} />
          </CardContent>
        </Card>
      )}
    </>
  )
}

export default UsersPage

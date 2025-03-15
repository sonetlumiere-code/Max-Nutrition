import EditUser from "@/components/dashboard/users/edit-user/edit-user"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { getRoles } from "@/data/roles"
import { getSafeUser } from "@/data/user"
import { hasPermission } from "@/helpers/helpers"
import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"
import { DEFAULT_REDIRECT_DASHBOARD } from "@/routes"

interface EditUserPageProps {
  params: {
    userId: string
  }
}

const EditUserPage = async ({ params }: EditUserPageProps) => {
  const session = await auth()
  const user = session?.user

  if (!user) {
    return redirect("/")
  }

  if (!hasPermission(user, "update:users")) {
    return redirect(DEFAULT_REDIRECT_DASHBOARD)
  }

  const { userId } = params

  const [userById, roles] = await Promise.all([
    getSafeUser({
      where: { id: userId },
      include: {
        role: true,
      },
    }),
    getRoles(),
  ])

  if (!userById || !roles) {
    redirect("/users")
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
            <BreadcrumbLink href='/users'>Usuarios</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Editar Usuario</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <EditUser user={userById} roles={roles} />
    </>
  )
}

export default EditUserPage

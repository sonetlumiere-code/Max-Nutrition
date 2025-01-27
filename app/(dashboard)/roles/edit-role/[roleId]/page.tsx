import CreateRole from "@/components/dashboard/roles/create-role/create-role"
import EditRole from "@/components/dashboard/roles/edit-role/edit-role"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { getPermissions } from "@/data/permissions"
import { getRole } from "@/data/roles"
import { hasPermission } from "@/helpers/helpers"
import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"

interface EditRolePageProps {
  params: {
    roleId: string
  }
}

const EditRolePage = async ({ params }: EditRolePageProps) => {
  const session = await auth()
  const user = session?.user

  if (!user) {
    return redirect("/")
  }

  if (!hasPermission(user, "update:roles")) {
    return redirect("/welcome")
  }

  const { roleId } = params

  const [role, permissions] = await Promise.all([
    getRole({
      where: { id: roleId },
      include: { permissions: true },
    }),
    getPermissions(),
  ])

  if (!role) {
    redirect("/roles")
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
            <BreadcrumbLink href='/roles'>Roles</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Editar Rol</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h2 className='font-semibold text-lg'>Editar Rol</h2>

      <EditRole role={role} permissions={permissions} />
    </>
  )
}

export default EditRolePage

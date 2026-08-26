"use client"

import { createRole } from "@/actions/roles/create-role"
import RoleForm from "@/components/dashboard/roles/role-form"
import { Permission } from "@prisma/client"

type CreateRoleProps = {
  permissions: Permission[] | null
}

const CreateRole = ({ permissions }: CreateRoleProps) => (
  <RoleForm
    permissions={permissions}
    defaultValues={{ name: "", permissionsIds: {} }}
    guardar={createRole}
    textoBoton='Agregar rol'
    avisoExito={{
      title: "Nuevo rol creado",
      description: "El rol ha sido creado correctamente.",
    }}
  />
)

export default CreateRole

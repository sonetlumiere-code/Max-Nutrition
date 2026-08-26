"use client"

import { editRole } from "@/actions/roles/edit-role"
import RoleForm from "@/components/dashboard/roles/role-form"
import { RoleSchema } from "@/lib/validations/role-validation"
import { PopulatedRole } from "@/types/types"
import { Permission } from "@prisma/client"

type EditRoleProps = {
  role: PopulatedRole
  permissions: Permission[] | null
}

const EditRole = ({ role, permissions }: EditRoleProps) => {
  // Los permisos vienen planos de la base y el formulario los pide agrupados
  // por sujeto, que es como se muestran.
  const defaultPermissionsIds = role.permissions.reduce(
    (acc, permission) => {
      const subjectKey = permission.subjectKey

      if (!acc[subjectKey]) {
        acc[subjectKey] = []
      }

      acc[subjectKey].push(permission.id)
      return acc
    },
    {} as Record<string, string[]>
  )

  return (
    <RoleForm
      permissions={permissions}
      defaultValues={{
        name: role.name,
        permissionsIds: defaultPermissionsIds,
      }}
      guardar={(values: RoleSchema) => editRole({ id: role.id, values })}
      textoBoton='Editar rol'
      avisoExito={{
        title: "Rol actualizado",
        description: "El rol ha sido actualizado correctamente.",
      }}
    />
  )
}

export default EditRole

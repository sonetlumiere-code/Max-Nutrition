"use client"

import { Icons } from "@/components/icons"
import { useConfirmation } from "@/components/confirmation-provider"
import { toast } from "@/components/ui/use-toast"
import { Role } from "@prisma/client"
import { deleteRole } from "@/actions/roles/delete-role"

type DeleteRoleProps = {
  role: Role
}

const DeleteRole = ({ role }: DeleteRoleProps) => {
  const confirm = useConfirmation()

  const onDelete = async () => {
    confirm({
      variant: "destructive",
      title: `¿Eliminar rol ${role.name}?`,
      description: "Esta acción es irreversible.",
    }).then(async () => {
      const res = await deleteRole({ id: role.id })

      if (res.success) {
        toast({
          title: "Rol eliminado",
          description: `El rol ${res.success.name} ha sido eliminado.`,
        })
      }

      if (res.error) {
        toast({
          variant: "destructive",
          title: "Error eliminando rol",
          description: res.error,
        })
      }
    })
  }

  return (
    <span onClick={onDelete} className='flex'>
      <Icons.trash2 className='w-4 h-4 text-destructive' />
      <p className='ml-2 text-destructive'>Eliminar</p>
    </span>
  )
}

export default DeleteRole

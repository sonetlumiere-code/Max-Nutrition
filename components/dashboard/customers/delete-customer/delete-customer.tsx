"use client"

import { deleteCustomer } from "@/actions/customer/delete-customer"
import { useConfirmation } from "@/components/confirmation-provider"
import { Icons } from "@/components/icons"
import { toast } from "@/components/ui/use-toast"
import { Customer } from "@prisma/client"

type DeleteCustomerProps = {
  customer: Customer
}

const DeleteCustomer = ({ customer }: DeleteCustomerProps) => {
  const confirm = useConfirmation()

  const onDelete = async () => {
    confirm({
      variant: "destructive",
      title: `¿Eliminar cliente ${customer.name}?`,
      description: "Esta acción es irreversible.",
    }).then(async () => {
      const res = await deleteCustomer({ id: customer.id })

      if (res.success) {
        toast({
          title: "Cliente eliminado",
          description: `El cliente ${res.success.name} ha sido eliminado.`,
        })
      }

      if (res.error) {
        toast({
          variant: "destructive",
          title: "Error eliminando cliente",
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

export default DeleteCustomer

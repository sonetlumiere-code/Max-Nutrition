import { deleteCustomerAddress } from "@/actions/customer-address/delete-customer-address"
import { useConfirmation } from "@/components/confirmation-provider"
import { Icons } from "@/components/icons"
import { toast } from "@/components/ui/use-toast"
import { translateAddressLabel } from "@/helpers/helpers"
import { AddressLabel, CustomerAddress } from "@prisma/client"

type DeleteCustomerAddressProps = {
  address: CustomerAddress
}

const DeleteCustomerAddress = ({ address }: DeleteCustomerAddressProps) => {
  const confirm = useConfirmation()

  const onDelete = async () => {
    const label =
      address.label !== AddressLabel.Other
        ? translateAddressLabel(address.label)
        : address.labelString

    confirm({
      variant: "destructive",
      title: `¿Eliminar dirección "${label}"?`,
      description: "Esta acción es irreversible.",
    }).then(async () => {
      const res = await deleteCustomerAddress({ id: address.id })

      if (res.success) {
        toast({
          title: "Dirección eliminada",
          description: `La dirección "${label}" ha sido eliminada.`,
        })
      }

      if (res.error) {
        toast({
          variant: "destructive",
          title: "Error eliminando dirección",
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

export default DeleteCustomerAddress

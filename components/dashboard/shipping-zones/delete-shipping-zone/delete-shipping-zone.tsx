"use client"

import { deleteShippingZone } from "@/actions/shipping-zones/delete-shipping-zone"
import { useConfirmation } from "@/components/confirmation-provider"
import { Icons } from "@/components/icons"
import { toast } from "@/components/ui/use-toast"
import { ShippingZone } from "@prisma/client"

type DeleteShippingZoneProps = {
  shippingZone: ShippingZone
}

const DeleteShippingZone = ({ shippingZone }: DeleteShippingZoneProps) => {
  const confirm = useConfirmation()

  const onDelete = async () => {
    confirm({
      variant: "destructive",
      title: `¿Eliminar zona de envío ${shippingZone.zone}?`,
      description: "Esta acción es irreversible.",
    }).then(async () => {
      const res = await deleteShippingZone({ id: shippingZone.id })

      if (res.success) {
        toast({
          title: "Zona de envío eliminada",
          description: `La zona de envío ${res.success.zone} ha sido eliminada.`,
        })
      }

      if (res.error) {
        toast({
          variant: "destructive",
          title: "Error eliminando zona de envío",
          description: res.error,
        })
      }
    })
  }

  return (
    <span onClick={onDelete} className='flex'>
      <Icons.thrash2 className='w-4 h-4 text-destructive' />
      <p className='ml-2 text-destructive'>Eliminar</p>
    </span>
  )
}

export default DeleteShippingZone

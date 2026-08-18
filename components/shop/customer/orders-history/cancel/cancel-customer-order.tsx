"use client"

import { cancelCustomerOrder } from "@/actions/orders/cancel-customer-order"
import { useConfirmation } from "@/components/confirmation-provider"
import { Icons } from "@/components/icons"
import { toast } from "@/components/ui/use-toast"
import { PopulatedOrder } from "@/types/types"

type CancelCustomerOrderProps = {
  order: PopulatedOrder
}

const CancelCustomerOrder = ({ order }: CancelCustomerOrderProps) => {
  const confirm = useConfirmation()

  const onCancel = async () => {
    confirm({
      variant: "destructive",
      title: `¿Cancelar pedido?`,
      description: "Esta acción es irreversible.",
    }).then(async () => {
      const res = await cancelCustomerOrder({ orderId: order.id })

      if (res.success) {
        toast({
          title: "Pedido cancelado.",
          description: "El pedido ha sido cancelado.",
        })
      }
      if (res.error) {
        toast({
          variant: "destructive",
          title: "Error cancelando pedido.",
          description: res.error,
        })
      }
    })
  }
  return (
    <span onClick={onCancel} className='flex'>
      <Icons.circleX className='w-4 h-4 text-destructive' />
      <p className='ml-2 text-destructive'>Cancelar</p>
    </span>
  )
}

export default CancelCustomerOrder

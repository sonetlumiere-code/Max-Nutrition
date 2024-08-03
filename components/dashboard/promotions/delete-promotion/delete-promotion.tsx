"use client"

import { Icons } from "@/components/icons"
import { Promotion } from "@prisma/client"
import { useConfirmation } from "@/components/confirmation-provider"
import { toast } from "@/components/ui/use-toast"
import { deletePromotion } from "@/actions/promotions/delete-promotion"

type DeletePromotionProps = {
  promotion: Promotion
}

const DeletePromotion = ({ promotion }: DeletePromotionProps) => {
  const confirm = useConfirmation()

  const onDelete = async () => {
    confirm({
      variant: "destructive",
      title: `¿Eliminar promoción ${promotion.name}?`,
      description: "Esta acción es irreversible.",
    }).then(async () => {
      const res = await deletePromotion({ id: promotion.id })

      if (res.success) {
        toast({
          title: "Promoción eliminada",
          description: `La promoción ${res.success.name} ha sido eliminada.`,
        })
      }

      if (res.error) {
        toast({
          variant: "destructive",
          title: "Error eliminando promoción",
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

export default DeletePromotion

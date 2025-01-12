"use client"

import { deleteShopBranch } from "@/actions/shop-branches/delete-shop-branch"
import { useConfirmation } from "@/components/confirmation-provider"
import { Icons } from "@/components/icons"
import { toast } from "@/components/ui/use-toast"
import { ShopBranch } from "@prisma/client"
import React from "react"

type DeleteShopBranchProps = {
  shopBranch: ShopBranch
}

const DeleteShopBranch = ({ shopBranch }: DeleteShopBranchProps) => {
  const confirm = useConfirmation()

  const onDelete = async () => {
    confirm({
      variant: "destructive",
      title: `¿Eliminar sucursal ${shopBranch.label}?`,
      description: "Esta acción es irreversible.",
    }).then(async () => {
      const res = await deleteShopBranch({ id: shopBranch.id })

      if (res.success) {
        toast({
          title: "Sucursal eliminada",
          description: `La sucursal ${res.success.label} ha sido eliminada.`,
        })
      }

      if (res.error) {
        toast({
          variant: "destructive",
          title: "Error eliminando sucursal",
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

export default DeleteShopBranch

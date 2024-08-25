"use client"

import { editProduct } from "@/actions/products/edit-product"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Product } from "@prisma/client"

type ShowProductBadgeProps = {
  product: Product
}

const ShowProductBadge = ({ product }: ShowProductBadgeProps) => {
  const toggleShowProduct = async () => {
    try {
      const res = await editProduct({
        id: product.id,
        values: { show: !product.show },
      })

      if (res.success) {
        toast({
          title: "Producto actualizado",
          description: "El producto se actualizó correctamente.",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error actualizando producto.",
        description: "Intenta nuevamente más tarde.",
      })
    }
  }

  return (
    <>
      {product.show ? (
        <Badge
          className='bg-emerald-500 hover:bg-emerald-500/80 cursor-pointer'
          onClick={toggleShowProduct}
        >
          Si
        </Badge>
      ) : (
        <Badge
          variant='destructive'
          className='cursor-pointer'
          onClick={toggleShowProduct}
        >
          No
        </Badge>
      )}
    </>
  )
}

export default ShowProductBadge

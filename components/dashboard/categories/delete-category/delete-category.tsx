"use client"

import { Icons } from "@/components/icons"
import { useConfirmation } from "@/components/confirmation-provider"
import { toast } from "@/components/ui/use-toast"
import { Category } from "@prisma/client"
import { deleteCategory } from "@/actions/categories/delete-category"

type DeleteCategoryProps = {
  category: Category
}

const DeleteCategory = ({ category }: DeleteCategoryProps) => {
  const confirm = useConfirmation()

  const onDelete = async () => {
    confirm({
      variant: "destructive",
      title: `¿Eliminar categoría ${category.name}?`,
      description: "Esta acción es irreversible.",
    }).then(async () => {
      const res = await deleteCategory({ id: category.id })

      if (res.success) {
        toast({
          title: "Categoría eliminada",
          description: `La categoría ${res.success.name} ha sido eliminada.`,
        })
      }

      if (res.error) {
        toast({
          variant: "destructive",
          title: "Error eliminando categoría",
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

export default DeleteCategory

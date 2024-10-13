"use client"

import { Icons } from "@/components/icons"
import { Ingredient } from "@prisma/client"
import { useConfirmation } from "@/components/confirmation-provider"
import { deleteIngredient } from "@/actions/ingredients/delete-ingredient"
import { toast } from "@/components/ui/use-toast"

type DeleteIngredientProps = {
  ingredient: Ingredient
}

const DeleteIngredient = ({ ingredient }: DeleteIngredientProps) => {
  const confirm = useConfirmation()

  const onDelete = async () => {
    confirm({
      variant: "destructive",
      title: `¿Eliminar ingrediente ${ingredient.name}?`,
      description: "Esta acción es irreversible.",
    }).then(async () => {
      const res = await deleteIngredient({ id: ingredient.id })

      if (res.success) {
        toast({
          title: "Ingrediente eliminado",
          description: `El ingrediente ${res.success.name} ha sido eliminado.`,
        })
      }

      if (res.error) {
        toast({
          variant: "destructive",
          title: "Error eliminando ingrediente",
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

export default DeleteIngredient

"use client"

import { Icons } from "@/components/icons"
import { Recipe } from "@prisma/client"
import { useConfirmation } from "@/components/confirmation-provider"
import { toast } from "@/components/ui/use-toast"
import { deleteRecipe } from "@/actions/recipes/delete-recipe"

type DeleteRecipeProps = {
  recipe: Recipe
}

const DeleteRecipe = ({ recipe }: DeleteRecipeProps) => {
  const confirm = useConfirmation()

  const onDelete = async () => {
    confirm({
      variant: "destructive",
      title: `¿Eliminar receta ${recipe.name}?`,
      description: "Esta acción es irreversible.",
    }).then(async () => {
      const res = await deleteRecipe({ id: recipe.id })

      if (res.success) {
        toast({
          title: "Receta eliminada",
          description: `La receta ${res.success.name} ha sido eliminada.`,
        })
      }

      if (res.error) {
        toast({
          variant: "destructive",
          title: "Error eliminando receta",
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

export default DeleteRecipe

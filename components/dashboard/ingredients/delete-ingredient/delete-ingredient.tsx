"use client"

import { Icons } from "@/components/icons"
import { Ingredient } from "@prisma/client"
import { useConfirmation } from "@/components/confirmation-provider"

type DeleteIngredientProps = {
  ingredient: Ingredient
}

const DeleteIngredient = ({ ingredient }: DeleteIngredientProps) => {
  const confirm = useConfirmation()

  const deleteIngredient = async () => {
    confirm({
      variant: "destructive",
      title: `¿Eliminar ingrediente ${ingredient.name}?`,
      description: "Esta acción es irreversible.",
    }).then(() => {
      console.log("confirmed")
    })
  }

  return (
    <span onClick={deleteIngredient} className='flex'>
      <Icons.thrash2 className='w-4 h-4 text-destructive' />
      <p className='ml-2 text-destructive'>Eliminar</p>
    </span>
  )
}

export default DeleteIngredient

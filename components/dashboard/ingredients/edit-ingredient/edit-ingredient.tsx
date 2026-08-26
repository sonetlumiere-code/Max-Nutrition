"use client"

import { editIngredient } from "@/actions/ingredients/edit-ingredient"
import IngredientForm from "@/components/dashboard/ingredients/ingredient-form"
import { IngredientSchema } from "@/lib/validations/ingredient-validation"
import { Ingredient } from "@prisma/client"

type EditIngredientProps = {
  ingredient: Ingredient
}

const EditIngredient = ({ ingredient }: EditIngredientProps) => (
  <IngredientForm
    defaultValues={{
      ...ingredient,
      price: ingredient.price,
      amountPerMeasurement: ingredient.amountPerMeasurement || 1,
    }}
    guardar={(values: IngredientSchema) =>
      editIngredient({ id: ingredient.id, values })
    }
    textoBoton='Editar Ingrediente'
    avisoExito={{
      title: "Ingrediente actualizado",
      description: "El ingrediente se actualizó correctamente.",
    }}
    tituloError='Error actualizando ingrediente.'
  />
)

export default EditIngredient

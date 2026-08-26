"use client"

import { editRecipe } from "@/actions/recipes/edit-recipe"
import RecipeForm from "@/components/dashboard/recipes/recipe-form"
import { RecipeSchema } from "@/lib/validations/recipe-validation"
import { PopulatedRecipe } from "@/types/types"
import { Ingredient } from "@prisma/client"

type EditRecipeProps = {
  recipe: PopulatedRecipe
  ingredients: Ingredient[] | null
}

const EditRecipe = ({ recipe, ingredients }: EditRecipeProps) => (
  <RecipeForm
    ingredients={ingredients}
    defaultValues={{
      name: recipe.name,
      description: recipe.description || "",
      ingredients: recipe.recipeIngredients,
    }}
    guardar={(values: RecipeSchema) => editRecipe({ id: recipe.id, values })}
    textoBoton='Editar Receta'
    avisoExito={{
      title: "Receta actualizada",
      description: "La receta se actualizó correctamente.",
    }}
    tituloError='Error actualizando receta.'
  />
)

export default EditRecipe

"use client"

import { createRecipe } from "@/actions/recipes/create-recipe"
import RecipeForm from "@/components/dashboard/recipes/recipe-form"
import { Ingredient, IngredientVariantScope } from "@prisma/client"

const CreateRecipe = ({
  ingredients,
}: {
  ingredients: Ingredient[] | null
}) => (
  <RecipeForm
    ingredients={ingredients}
    defaultValues={{
      name: "",
      description: "",
      ingredients: [
        {
          ingredientId: "",
          quantity: 0,
          variantScope: IngredientVariantScope.ALWAYS,
        },
      ],
    }}
    guardar={createRecipe}
    textoBoton='Agregar Receta'
    avisoExito={{
      title: "Nueva receta creada",
      description: "La receta ha sido creada correctamente.",
    }}
    tituloError='Error creando receta'
  />
)

export default CreateRecipe

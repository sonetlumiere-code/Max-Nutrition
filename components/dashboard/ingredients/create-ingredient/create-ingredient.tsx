"use client"

import { createIngredient } from "@/actions/ingredients/create-ingredient"
import IngredientForm from "@/components/dashboard/ingredients/ingredient-form"

const CreateIngredient = () => (
  <IngredientForm
    defaultValues={{
      name: "",
      price: 0,
      waste: 0,
      carbs: 0,
      proteins: 0,
      fats: 0,
      fiber: 0,
      amountPerMeasurement: 1,
    }}
    guardar={createIngredient}
    textoBoton='Agregar Ingrediente'
    avisoExito={{
      title: "Nuevo ingrediente creado",
      description: "El ingrediente ha sido creado correctamente.",
    }}
    tituloError='Error creando ingrediente'
  />
)

export default CreateIngredient

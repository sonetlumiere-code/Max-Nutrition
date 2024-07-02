import { getIngredient } from "@/data/ingredients"

interface EditIngredientPageProps {
  params: { ingredientId: string }
}

const EditIngredientPage = async ({ params }: EditIngredientPageProps) => {
  const { ingredientId } = params

  const ingredientToEdit = await getIngredient({ where: { id: ingredientId } })

  return <div>{JSON.stringify(ingredientToEdit)}</div>
}

export default EditIngredientPage

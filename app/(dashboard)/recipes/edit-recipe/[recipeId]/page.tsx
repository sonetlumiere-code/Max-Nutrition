import { getIngredient } from "@/data/ingredients"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { redirect } from "next/navigation"
import EditRecipe from "@/components/dashboard/recipes/edit-recipe/edit-recipe"
import { getRecipe } from "@/data/recipes"

interface EditRecipePageProps {
  params: {
    recipeId: string
  }
}

const EditRecipePage = async ({ params }: EditRecipePageProps) => {
  const { recipeId } = params

  const recipe = await getRecipe({ where: { id: recipeId } })

  if (!recipe) {
    redirect("/welcome")
  }

  return (
    <div className='space-y-6'>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink>Inicio</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href='/ingredients'>Recetas</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Editar Receta</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h2 className='font-semibold text-lg'>Editar Receta</h2>

      <EditRecipe recipe={recipe} />
    </div>
  )
}

export default EditRecipePage

import EditRecipe from "@/components/dashboard/recipes/edit-recipe/edit-recipe"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { getIngredients } from "@/data/ingredients"
import { getRecipe } from "@/data/recipes"
import { hasPermission } from "@/helpers/helpers"
import { auth } from "@/lib/auth/auth"
import { DEFAULT_REDIRECT_DASHBOARD } from "@/routes"
import { redirect } from "next/navigation"

interface EditRecipePageProps {
  params: {
    recipeId: string
  }
}

const EditRecipePage = async ({ params }: EditRecipePageProps) => {
  const session = await auth()
  const user = session?.user

  if (!user) {
    return redirect("/")
  }

  if (!hasPermission(user, "update:recipes")) {
    return redirect(DEFAULT_REDIRECT_DASHBOARD)
  }

  const { recipeId } = params

  const [recipe, ingredients] = await Promise.all([
    getRecipe({
      where: { id: recipeId },
      include: { recipeIngredients: true },
    }),
    getIngredients({
      orderBy: {
        name: "asc",
      },
    }),
  ])

  if (!recipe) {
    redirect(DEFAULT_REDIRECT_DASHBOARD)
  }

  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink>Inicio</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href='/recipes'>Recetas</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Editar Receta</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h2 className='font-semibold text-lg'>Editar Receta</h2>

      <EditRecipe recipe={recipe} ingredients={ingredients} />
    </>
  )
}

export default EditRecipePage

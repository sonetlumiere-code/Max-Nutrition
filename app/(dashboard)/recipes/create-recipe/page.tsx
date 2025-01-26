import CreateRecipe from "@/components/dashboard/recipes/create-recipe/create-recipe"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { getIngredients } from "@/data/ingredients"
import { hasPermission } from "@/helpers/helpers"
import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"

const CreateRecipePage = async () => {
  const session = await auth()
  const user = session?.user

  if (!user) {
    redirect("/")
  }

  if (!hasPermission(user, "create:recipes")) {
    return redirect("/")
  }

  const ingredients = await getIngredients({
    orderBy: {
      name: "asc",
    },
  })

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
            <BreadcrumbPage>Agregar Receta</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h2 className='font-semibold text-lg'>Agregar Receta</h2>

      <CreateRecipe ingredients={ingredients} />
    </>
  )
}

export default CreateRecipePage

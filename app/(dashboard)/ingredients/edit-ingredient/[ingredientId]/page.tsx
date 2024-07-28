import { getIngredient } from "@/data/ingredients"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import EditIngredient from "@/components/dashboard/ingredients/edit-ingredient/edit-ingredient"
import { redirect } from "next/navigation"

interface EditIngredientPageProps {
  params: { ingredientId: string }
}

const EditIngredientPage = async ({ params }: EditIngredientPageProps) => {
  const { ingredientId } = params

  const ingredient = await getIngredient({
    where: { id: ingredientId },
  })

  if (!ingredient) {
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
            <BreadcrumbLink href='/ingredients'>Ingredientes</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Editar Ingrediente</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h2 className='font-semibold text-lg'>Editar Ingrediente</h2>

      <EditIngredient ingredient={ingredient} />
    </div>
  )
}

export default EditIngredientPage

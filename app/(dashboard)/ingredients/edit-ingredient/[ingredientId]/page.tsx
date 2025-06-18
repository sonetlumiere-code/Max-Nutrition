import EditIngredient from "@/components/dashboard/ingredients/edit-ingredient/edit-ingredient"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { getIngredient } from "@/data/ingredients"
import { hasPermission } from "@/helpers/helpers"
import { verifySession } from "@/lib/auth/verify-session"
import { DEFAULT_REDIRECT_DASHBOARD } from "@/routes"
import { redirect } from "next/navigation"

interface EditIngredientPageProps {
  params: { ingredientId: string }
}

const EditIngredientPage = async ({ params }: EditIngredientPageProps) => {
  const session = await verifySession()
  const user = session?.user

  if (!user) {
    return redirect("/")
  }

  if (!hasPermission(user, "update:ingredients")) {
    return redirect(DEFAULT_REDIRECT_DASHBOARD)
  }

  const { ingredientId } = params

  const ingredient = await getIngredient({
    where: { id: ingredientId },
  })

  if (!ingredient) {
    return redirect(DEFAULT_REDIRECT_DASHBOARD)
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
    </>
  )
}

export default EditIngredientPage

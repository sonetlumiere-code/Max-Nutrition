import EditPromotion from "@/components/dashboard/promotions/edit-promotion/edit-promotion"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { getCategories } from "@/data/categories"
import { getPromotion } from "@/data/promotions"
import { hasPermission } from "@/helpers/helpers"
import { redirect } from "next/navigation"
import { DEFAULT_REDIRECT_DASHBOARD } from "@/routes"
import { verifySession } from "@/lib/auth/verify-session"

interface EditPromotionPageProps {
  params: Promise<{
    promotionId: string
  }>
}

const EditPromotionPage = async (props: EditPromotionPageProps) => {
  const params = await props.params;
  const session = await verifySession()
  const user = session?.user

  if (!user) {
    return redirect("/")
  }

  if (!hasPermission(user, "update:promotions")) {
    return redirect(DEFAULT_REDIRECT_DASHBOARD)
  }

  const { promotionId } = params

  const [promotion, categories] = await Promise.all([
    getPromotion({
      where: { id: promotionId },
      include: { categories: true },
    }),
    getCategories(),
  ])

  if (!promotion) {
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
            <BreadcrumbLink href='/promotions'>Promociones</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Editar Promoción</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <EditPromotion promotion={promotion} categories={categories} />
    </>
  )
}

export default EditPromotionPage

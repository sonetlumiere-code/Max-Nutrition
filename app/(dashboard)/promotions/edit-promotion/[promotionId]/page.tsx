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
import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"

interface EditPromotionPageProps {
  params: {
    promotionId: string
  }
}

const EditPromotionPage = async ({ params }: EditPromotionPageProps) => {
  const session = await auth()

  if (session?.user.role !== "ADMIN") {
    return redirect("/")
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
    redirect("/orders")
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

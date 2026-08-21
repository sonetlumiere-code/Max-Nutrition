import { redirect } from "next/navigation"
import { getOrder } from "@/data/orders"
import OrderConfirmed from "@/components/shop/order-confirmed/order-confirmed"
import Link from "next/link"
import { Icons } from "@/components/icons"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { DEFAULT_REDIRECT_SHOP } from "@/routes"
import { verifySession } from "@/lib/auth/verify-session"

interface PageProps {
  params: Promise<{ orderId: string }>
}

export default async function OrderConfirmedPage(props: PageProps) {
  const params = await props.params;
  const { orderId } = params

  if (!orderId) {
    return redirect(DEFAULT_REDIRECT_SHOP)
  }

  const session = await verifySession()

  if (!session?.user) {
    return null
  }

  // La consulta va dentro del try; el JSX y las redirecciones, afuera. Además
  // de ser lo que pide React, evita que el catch se trague el error especial
  // con el que `redirect` corta la ejecución y lo loguee como una falla.
  let order

  try {
    order = await getOrder({
      where: {
        id: orderId,
        customer: {
          userId: session.user.id,
        },
      },
      include: {
        shop: true,
        shopBranch: true,
        items: {
          include: {
            product: true,
          },
        },
        customer: {
          include: {
            user: true,
            addresses: true,
          },
        },
        address: true,
        appliedPromotions: true,
      },
    })
  } catch (error) {
    console.error("Error fetching order data:", error)
    return redirect(DEFAULT_REDIRECT_SHOP)
  }

  if (!order || !order.shop) {
    return redirect(DEFAULT_REDIRECT_SHOP)
  }

  return (
    <div className='space-y-6 w-full max-w-3xl mx-auto pt-5 px-4 md:px-6'>
      <div className='flex items-start'>
        <Link
          href={`/${order.shop.key}`}
          className={cn(buttonVariants({ variant: "ghost" }), "")}
        >
          <>
            <Icons.chevronLeft className='mr-2 h-4 w-4' />
            Volver a tienda
          </>
        </Link>
      </div>

      <OrderConfirmed order={order} />
    </div>
  )
}

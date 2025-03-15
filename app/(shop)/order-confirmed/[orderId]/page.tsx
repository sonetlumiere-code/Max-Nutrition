import { redirect } from "next/navigation"
import { getOrder } from "@/data/orders"
import OrderConfirmed from "@/components/shop/order-confirmed/order-confirmed"
import { auth } from "@/lib/auth/auth"
import Link from "next/link"
import { Icons } from "@/components/icons"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { DEFAULT_REDIRECT } from "@/routes"

interface PageProps {
  params: { orderId: string }
}

export default async function OrderConfirmedPage({ params }: PageProps) {
  const { orderId } = params

  if (!orderId) {
    redirect(DEFAULT_REDIRECT)
  }

  const session = await auth()

  if (!session?.user) {
    return null
  }

  try {
    const order = await getOrder({
      where: {
        id: orderId,
        customer: {
          userId: session.user.id,
        },
      },
      include: {
        shop: true,
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

    if (!order || !order.shop) {
      redirect(DEFAULT_REDIRECT)
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
  } catch (error) {
    console.error("Error fetching order data:", error)
    redirect(DEFAULT_REDIRECT)
  }
}

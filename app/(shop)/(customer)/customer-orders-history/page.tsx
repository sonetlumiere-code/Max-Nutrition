import { Icons } from "@/components/icons"
import CustomerOrdersHistory from "@/components/shop/customer/orders-history/customer-orders-history"
import { buttonVariants } from "@/components/ui/button"
import { getCustomer } from "@/data/customer"
import { auth } from "@/lib/auth/auth"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { redirect } from "next/navigation"

const CustomerOrdersHistoryPage = async () => {
  const session = await auth()

  const customer = await getCustomer({
    where: {
      userId: session?.user.id,
    },
    include: {
      address: true,
      user: {
        select: {
          email: true,
          name: true,
        },
      },
      orders: {
        take: 10,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          address: true,
          appliedPromotions: true,
          shopBranch: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      },
    },
  })

  if (!customer) {
    redirect("/shop")
  }

  return (
    <div className='space-y-6 w-full max-w-3xl mx-auto pt-5 px-4 md:px-6'>
      <div className='flex items-start'>
        <Link
          href='/shop'
          className={cn(buttonVariants({ variant: "ghost" }), "")}
        >
          <>
            <Icons.chevronLeft className='mr-2 h-4 w-4' />
            Volver a tienda
          </>
        </Link>
      </div>

      {customer?.orders && <CustomerOrdersHistory orders={customer?.orders} />}
    </div>
  )
}

export default CustomerOrdersHistoryPage

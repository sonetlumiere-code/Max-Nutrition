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

  const customer = await getCustomer(session?.user.id || "")

  if (!customer) {
    redirect("/shop")
  }

  return (
    <div className='space-y-6'>
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

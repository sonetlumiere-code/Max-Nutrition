import { Icons } from "@/components/icons"
import CustomerOrdersHistory from "@/components/shop/customer/orders-history/customer-orders-history"
import { buttonVariants } from "@/components/ui/button"
import { getCustomer } from "@/data/customer"
import { auth } from "@/lib/auth/auth"
import { cn } from "@/lib/utils"
import { Role } from "@prisma/client"
import Link from "next/link"

const CustomerOrdersHistoryPage = async () => {
  const session = await auth()

  const customer =
    session?.user.role === Role.USER
      ? await getCustomer(session?.user.id || "")
      : null

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

      <h2 className='text-xl text-center'>Historial de pedidos</h2>

      {customer?.orders && <CustomerOrdersHistory orders={customer?.orders} />}
    </div>
  )
}

export default CustomerOrdersHistoryPage

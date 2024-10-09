import { Icons } from "@/components/icons"
import CustomerAddresses from "@/components/shop/customer/info/address/list/customer-addresses"
import CustomerPersonalInfo from "@/components/shop/customer/info/personal-info/customer-personal-info"
import { buttonVariants } from "@/components/ui/button"
import { getCustomer } from "@/data/customer"
import { auth } from "@/lib/auth/auth"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { redirect } from "next/navigation"
// import { Role } from "@prisma/client"

const CustomerInfoPage = async () => {
  const session = await auth()

  // const customer =
  //   session?.user.role === Role.USER
  //     ? await getCustomer(session?.user.id || "")
  //     : null

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

      {customer && (
        <>
          <CustomerPersonalInfo customer={customer} />
          <CustomerAddresses customer={customer} />
        </>
      )}
    </div>
  )
}

export default CustomerInfoPage

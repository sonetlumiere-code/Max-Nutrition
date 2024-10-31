import Link from "next/link"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { auth } from "@/lib/auth/auth"
import { getCustomer } from "@/data/customer"
import { buttonVariants } from "@/components/ui/button"
import dynamic from "next/dynamic"
import { redirect } from "next/navigation"
import { getShippingSettings } from "@/data/shipping-settings"

const Checkout = dynamic(() => import("@/components/shop/checkout/checkout"), {
  ssr: false,
})

export default async function CheckoutPage() {
  const session = await auth()

  const customer = await getCustomer(session?.user.id || "")

  if (!customer) {
    redirect("/shop")
  }

  const shippingSettings = await getShippingSettings()

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

      <Checkout customer={customer} shippingSettings={shippingSettings} />
    </div>
  )
}

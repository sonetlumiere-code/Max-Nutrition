/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import dynamic from "next/dynamic"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import CustomerProfileDropdown from "./customer-profile-dropdown"
import { Session } from "next-auth"

const CartNavButton = dynamic(() => import("./cart-icon-button"), {
  ssr: false,
})

type HeaderShopProps = {
  session: Session | null
}

export default async function HeaderShop({ session }: HeaderShopProps) {
  return (
    <header className='flex items-center justify-between bg-white shadow-sm px-4 sm:px-6 lg:px-8 py-4'>
      <Link href='/' className='flex items-center gap-2' prefetch={false}>
        <img
          src='img/mxm-logo.png'
          width='116'
          height='41'
          alt='MXM Máxima Nutrición'
          className='object-cover'
        />
      </Link>
      {/* <div className='hidden lg:inline relative flex-1 max-w-md mx-4'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground' />
          <Input
            type='search'
            placeholder='Buscar producto..'
            className='w-full rounded-full bg-muted pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary'
          />
        </div> */}

      <div className='flex items-center space-x-4'>
        <CartNavButton />
        {session?.user ? (
          <CustomerProfileDropdown session={session} />
        ) : (
          <Link
            href='/login'
            className={cn(buttonVariants({ variant: "outline" }), "")}
          >
            <Icons.user className='w-5 h-5 mr-2' /> Ingresar
          </Link>
        )}
      </div>
    </header>
  )
}

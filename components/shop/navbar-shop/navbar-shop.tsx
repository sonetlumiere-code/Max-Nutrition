/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Search, User } from "lucide-react"
import dynamic from "next/dynamic"
import { Role } from "@prisma/client"
import { auth } from "@/lib/auth/auth"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import ProfileDropdown from "./profile-dropdown"
import { PopulatedCustomer } from "@/types/types"

const CartNavButton = dynamic(() => import("./cart-nav-button"), {
  ssr: false,
})

type NavbarShopProps = {
  customer: PopulatedCustomer | null
}

export default async function NavbarShop({ customer }: NavbarShopProps) {
  const session = await auth()
  const isAdmin = session?.user.role === Role.ADMIN

  return (
    <>
      {isAdmin ? (
        <header className='text-center bg-slate-300 px-4 sm:px-6 lg:px-8 py-4'>
          <Link
            href='/welcome'
            className={cn(
              buttonVariants({
                variant: "secondary",
              }),
              ""
            )}
          >
            <Icons.layoutDashboard className='w-4 h-4 mr-2' />
            Admin panel
          </Link>
        </header>
      ) : null}
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
        <div className='hidden lg:inline relative flex-1 max-w-md mx-4'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground' />
          <Input
            type='search'
            placeholder='Buscar producto..'
            className='w-full rounded-full bg-muted pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary'
          />
        </div>
        <div className='flex items-center gap-4'>
          {/* <Link href='#' className='relative' prefetch={false}>
            <MapPin className='w-6 h-6 text-muted-foreground' />
          </Link> */}
          {/* <Link href='#' className='relative' prefetch={false}>
          <Bell className='w-6 h-6 text-muted-foreground' />
          <div className='absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center text-xs font-medium'>
            2
          </div>
        </Link> */}

          {session?.user ? (
            <>
              <CartNavButton />

              <ProfileDropdown session={session} customer={customer} />
            </>
          ) : (
            <Link
              href='/login'
              className={cn(buttonVariants({ variant: "outline" }), "")}
            >
              <User className='w-5 h-5 mr-2 ' /> Ingresar
            </Link>
          )}
        </div>
      </header>
    </>
  )
}

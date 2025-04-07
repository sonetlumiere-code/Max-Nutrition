/* eslint-disable @next/next/no-img-element */
"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { navItems } from "@/lib/constants/nav-items"
import { Icons } from "@/components/icons"
import { Session } from "next-auth"
import { getPermissionsKeys } from "@/helpers/helpers"

type SheetSideNavDashboardProps = {
  session: Session | null
}

const SheetSideNavDashboard = ({ session }: SheetSideNavDashboardProps) => {
  const pathname = usePathname()
  const isActive = (href: string) => pathname === href

  const userPermissionsKeys = getPermissionsKeys(
    session?.user.role?.permissions
  )

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant='outline' size='icon' className='shrink-0 md:hidden'>
          <Icons.menu className='h-5 w-5' />
          <span className='sr-only'>Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side='left' className='flex flex-col'>
        <SheetHeader>
          <SheetTitle>
            <Link href='/' className='block'>
              <span className='sr-only'>HOME</span>
              <img
                src='img/logo-mxm.svg'
                alt='MXM Máxima Nutrición'
                className='mx-auto py-4 w-36'
              />
            </Link>
          </SheetTitle>
          <SheetDescription></SheetDescription>
        </SheetHeader>
        <nav className='grid gap-2 font-medium'>
          {navItems
            .filter((item) => userPermissionsKeys?.includes(item.permissionKey))
            .map((item) => {
              const Icon = Icons[item.icon]
              return (
                <SheetClose asChild key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-1.5 ${
                      isActive(item.href)
                        ? "bg-muted text-primary"
                        : "text-muted-foreground"
                    } transition-all hover:text-primary`}
                  >
                    <Icon className='h-4 w-4' />
                    {item.label}
                  </Link>
                </SheetClose>
              )
            })}
        </nav>
        {/* <div className='mt-auto'>
          <OpenShopCard />
        </div> */}
      </SheetContent>
    </Sheet>
  )
}

export default SheetSideNavDashboard

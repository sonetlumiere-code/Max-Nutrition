/* eslint-disable @next/next/no-img-element */
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { navItems } from "@/lib/constants/nav-items"
import { Icons } from "@/components/icons"
import { Session } from "next-auth"
import { getPermissionsKeys } from "@/helpers/helpers"
import { Separator } from "@/components/ui/separator"

type SideNavDashboardProps = {
  session: Session | null
}

export default function SideNavDashboard({ session }: SideNavDashboardProps) {
  const pathname = usePathname()
  const isActive = (href: string) => pathname === href

  const userPermissionsKeys = getPermissionsKeys(
    session?.user.role?.permissions
  )

  return (
    <div className='hidden border-r bg-muted/40 md:block'>
      <div className='flex h-full max-h-screen flex-col'>
        <div className='flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6'>
          <Link href='/' className='flex items-center gap-2 font-semibold'>
            <span className='sr-only'>HOME</span>
            <img
              src='img/logo-mxm.svg'
              alt='MXM Máxima Nutrición'
              className='mx-auto py-4 w-24'
            />
          </Link>

          {/* <Button variant='outline' size='icon' className='ml-auto h-8 w-8'>
            <Icons.bell className='h-4 w-4' />
            <span className='sr-only'>Toggle notifications</span>
          </Button> */}
        </div>
        <div className='flex-1'>
          <nav className='grid gap-1 items-start p-2 font-medium lg:p-4'>
            {navItems
              .filter((item) =>
                userPermissionsKeys?.includes(item.permissionKey)
              )
              .map((item) => {
                const Icon = Icons[item.icon]
                return (
                  <Link
                    key={item.href}
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
                )
              })}
          </nav>
          <Separator />
        </div>
        {/* <div className='mt-auto p-4'>
          <OpenShopCard />
        </div> */}
      </div>
    </div>
  )
}

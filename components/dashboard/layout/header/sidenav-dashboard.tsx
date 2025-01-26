/* eslint-disable @next/next/no-img-element */
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { navItems } from "@/lib/constants/nav-items"
import { Icons } from "@/components/icons"
import { Session } from "next-auth"

type SideNavDashboardProps = {
  session: Session | null
}

export default function SideNavDashboard({ session }: SideNavDashboardProps) {
  const pathname = usePathname()
  const isActive = (href: string) => pathname === href

  const userPermissionsKeys =
    session?.user.role?.permissions?.map(
      (permission) => `${permission.actionKey}:${permission.subjectKey}`
    ) || []

  return (
    <div className='hidden border-r bg-muted/40 md:block'>
      <div className='flex h-full max-h-screen flex-col gap-2'>
        <div className='flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6'>
          <Link href='/' className='flex items-center gap-2 font-semibold'>
            <span className='sr-only'>HOME</span>
            <img
              src='img/mxm-logo.png'
              alt='MXM Máxima Nutrición'
              className='mx-auto py-4'
            />
          </Link>

          {/* <Button variant='outline' size='icon' className='ml-auto h-8 w-8'>
            <Icons.bell className='h-4 w-4' />
            <span className='sr-only'>Toggle notifications</span>
          </Button> */}
        </div>
        <div className='flex-1'>
          <nav className='grid items-start px-2 font-medium lg:px-4'>
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
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
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
            <hr />
          </nav>
        </div>
        {/* <div className='mt-auto p-4'>
          <OpenShopCard />
        </div> */}
      </div>
    </div>
  )
}

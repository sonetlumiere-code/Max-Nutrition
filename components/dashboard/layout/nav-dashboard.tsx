"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { navItems } from "@/lib/constants/nav-items"
import { Icons } from "@/components/icons"

export default function NavDashboard() {
  const pathname = usePathname()

  const isActive = (href: string) => pathname === href

  return (
    <div className='hidden border-r bg-muted/40 md:block'>
      <div className='flex h-full max-h-screen flex-col gap-2'>
        <div className='flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6'>
          <Link href='/' className='flex items-center gap-2 font-semibold'>
            <span>Máxima Nutrición </span>
          </Link>
          <Button variant='outline' size='icon' className='ml-auto h-8 w-8'>
            <Icons.bell className='h-4 w-4' />
            <span className='sr-only'>Toggle notifications</span>
          </Button>
        </div>
        <div className='flex-1'>
          <nav className='grid items-start px-2 font-medium lg:px-4'>
            {navItems.map((item) => {
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
        <div className='mt-auto p-4'>
          <Card>
            <CardHeader className='p-2 pt-0 md:p-4'>
              <CardTitle>Abrir tienda</CardTitle>
              <CardDescription>
                Horario activo: 7:00 hs a 23:00 hs
              </CardDescription>
            </CardHeader>
            <CardContent className='p-2 pt-0 md:p-4 md:pt-0'>
              <Button size='sm' className='w-full'>
                Abrir tienda
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

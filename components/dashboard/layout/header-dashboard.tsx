"use client"

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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import SignOutButton from "../../sign-out-button"
import { navItems } from "../../../lib/constants/nav-items"
import { Icons } from "@/components/icons"
import { usePathname } from "next/navigation"

export default function HeaderDashboard() {
  const pathname = usePathname()

  const isActive = (href: string) => pathname === href

  return (
    <header className='flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6'>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant='outline' size='icon' className='shrink-0 md:hidden'>
            <Icons.menu className='h-5 w-5' />
            <span className='sr-only'>Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side='left' className='flex flex-col'>
          <SheetHeader>
            <SheetTitle>Máxima nutrición</SheetTitle>
            <SheetDescription></SheetDescription>
          </SheetHeader>
          <nav className='grid gap-2 font-medium'>
            {navItems.map((item) => {
              const Icon = Icons[item.icon]
              return (
                <SheetClose asChild key={item.href}>
                  <Link
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
                </SheetClose>
              )
            })}
          </nav>
          <div className='mt-auto'>
            <Card>
              <CardHeader>
                <CardTitle>Abrir tienda</CardTitle>
                <CardDescription>
                  Horario activo: 7:00 hs a 23:00 hs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button size='sm' className='w-full'>
                  Abrir tienda
                </Button>
              </CardContent>
            </Card>
          </div>
        </SheetContent>
      </Sheet>
      <div className='w-full flex-1'>
        <form>
          <div className='relative'>
            <Icons.search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              type='search'
              placeholder='Buscar recetas...'
              className='w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3'
            />
          </div>
        </form>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='secondary' size='icon' className='rounded-full'>
            <Icons.circleUser className='h-5 w-5' />
            <span className='sr-only'>Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Configuración</DropdownMenuItem>
          <DropdownMenuSeparator />
          <SignOutButton>
            <DropdownMenuItem className='cursor-pointer'>
              Cerrar sesión
            </DropdownMenuItem>
          </SignOutButton>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}

"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Bell,
  Home,
  ShoppingCart,
  Users,
  LineChart,
  Package2,
  NotebookText,
  Wheat,
  Pizza,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

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
            <Bell className='h-4 w-4' />
            <span className='sr-only'>Toggle notifications</span>
          </Button>
        </div>
        <div className='flex-1'>
          <nav className='grid items-start px-2 font-medium lg:px-4'>
            {[
              { href: "/welcome", label: "Inicio", icon: Home },
              { href: "/orders", label: "Pedidos", icon: ShoppingCart },
              { href: "/products", label: "Productos", icon: Pizza },
              { href: "/recipes", label: "Recetas", icon: NotebookText },
              { href: "/ingredients", label: "Ingredientes", icon: Wheat },
              { href: "/customers", label: "Clientes", icon: Users },
              { href: "/analytics", label: "Analytics", icon: LineChart },
            ].map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                  isActive(href)
                    ? "bg-muted text-primary"
                    : "text-muted-foreground"
                } transition-all hover:text-primary`}
              >
                <Icon className='h-4 w-4' />
                {label}
              </Link>
            ))}
            <hr />
          </nav>
        </div>
        <div className='mt-auto p-4'>
          <Card>
            <CardHeader className='p-2 pt-0 md:p-4'>
              <CardTitle>Abrir tienda</CardTitle>
              <CardDescription>
                Unlock all features and get unlimited access to our support
                team.
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

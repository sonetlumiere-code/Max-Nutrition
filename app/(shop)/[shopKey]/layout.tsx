import { CartProvider } from "@/components/cart-provider"
import Cart from "@/components/shop/cart/cart"
import HeaderShop from "@/components/shop/layout/header/header-shop"
import { getShop } from "@/data/shops"
import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"
import { ReactNode } from "react"

interface ShopLayoutProps {
  children: ReactNode
  params: {
    shopKey: string
  }
}

export default async function ShopLayout({
  children,
  params,
}: ShopLayoutProps) {
  const session = await auth()
  const { shopKey } = params

  const shop = await getShop({
    where: { key: shopKey, isActive: true },
    include: {
      operationalHours: true,
    },
  })

  if (!shop) {
    console.log("Tienda no encontrada.")
    redirect("/home")
  }

  return (
    <CartProvider session={session} shop={shop}>
      <Cart />

      <div className='grid min-h-screen grid-rows-[auto_1fr_auto]'>
        <HeaderShop session={session} shop={shop} />
        <main className='flex flex-col w-full mx-auto pb-16'>{children}</main>
        <footer className='h-20 bg-gray-200 flex items-center justify-center p-4'>
          <p className='text-sm text-muted-foreground'>
            © {new Date().getFullYear()} Máxima Nutrición. Todos los derechos
            reservados. | Seguinos en nuestras redes sociales.
          </p>
        </footer>
      </div>
    </CartProvider>
  )
}

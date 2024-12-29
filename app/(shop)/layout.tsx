import { CartProvider } from "@/components/cart-provider"
import Cart from "@/components/shop/cart/cart"
import HeaderShop from "@/components/shop/layout/header/header-shop"
import { auth } from "@/lib/auth/auth"
import { ReactNode } from "react"

interface ShopLayoutProps {
  children: ReactNode
}

export default async function ShopLayout({ children }: ShopLayoutProps) {
  const session = await auth()

  return (
    <CartProvider session={session}>
      <Cart />
      <HeaderShop session={session} />
      <main className='flex flex-col w-full mx-auto pb-16 min-h-[80dvh]'>
        {children}
      </main>
      <footer className='h-20 bg-gray-200 flex items-center justify-center p-4 mt-8'>
        <p className='text-sm text-muted-foreground'>
          © {new Date().getFullYear()} Máxima Nutrición. Todos los derechos
          reservados. | Seguinos en nuestras redes sociales.
        </p>
      </footer>
    </CartProvider>
  )
}

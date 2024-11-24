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
      <main className='flex flex-col w-full max-w-4xl mx-auto pt-8 pb-16 px-4 md:px-6'>
        {children}
      </main>
    </CartProvider>
  )
}

import { CartProvider } from "@/components/cart-provider"
import { ReactNode } from "react"
import Cart from "@/components/shop/cart/cart"
import HeaderShop from "@/components/shop/layout/header/header-shop"
import { getCustomer } from "@/data/customer"
import { auth } from "@/lib/auth/auth"
import { Role } from "@prisma/client"

interface ShopLayoutProps {
  children: ReactNode
}

export default async function ShopLayout({ children }: ShopLayoutProps) {
  const session = await auth()

  const customer =
    session?.user.role === Role.USER
      ? await getCustomer(session?.user.id || "")
      : null

  return (
    <CartProvider session={session}>
      <Cart session={session} customer={customer} />
      <HeaderShop />
      <main className='flex flex-col w-full max-w-4xl mx-auto pt-8 pb-24 px-4 md:px-6'>
        {children}
      </main>
    </CartProvider>
  )
}

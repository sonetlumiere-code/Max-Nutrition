import { CartProvider } from "@/components/cart-provider"
import Cart from "@/components/shop/cart/cart"
import HeaderShop from "@/components/shop/layout/header/header-shop"
import { auth } from "@/lib/auth/auth"
import { ShopCategory } from "@prisma/client"
import { ReactNode } from "react"

interface FoodsShopLayoutProps {
  children: ReactNode
}

export default async function FoodsShopLayout({
  children,
}: FoodsShopLayoutProps) {
  const session = await auth()
  const shopCategory = ShopCategory.FOOD

  return (
    <CartProvider session={session} shopCategory={shopCategory}>
      <Cart />

      <div className='grid min-h-screen grid-rows-[auto_1fr_auto]'>
        <HeaderShop session={session} shopCategory={shopCategory} />
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

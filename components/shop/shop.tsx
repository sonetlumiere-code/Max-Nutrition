import dynamic from "next/dynamic"
import { CartProvider } from "../cart-provider"
import NavbarShop from "./navbar-shop/navbar-shop"
import ProductsList from "./products/products-list"
import { auth } from "@/lib/auth/auth"

const Cart = dynamic(() => import("./cart/cart"), {
  ssr: false,
})

const CartFixedButton = dynamic(() => import("./cart-fixed-button"), {
  ssr: false,
})

const Shop = async () => {
  const session = await auth()

  return (
    <CartProvider>
      <Cart />

      <NavbarShop />

      <div className='flex flex-col w-full max-w-4xl mx-auto pt-8 pb-24 px-4 md:px-6'>
        <header className='flex items-center justify-between mb-8 bg-emerald-100 p-4 rounded-md'>
          <p className='text-sm text-muted-foreground'>
            Elige entre nuestra variedad semanal de platos. Cambiamos el menú
            cada lunes, así que si te gusta algo, pídelo antes de que acabe el
            domingo.
          </p>
        </header>

        <ProductsList />

        {session?.user && <CartFixedButton />}
      </div>
    </CartProvider>
  )
}

export default Shop

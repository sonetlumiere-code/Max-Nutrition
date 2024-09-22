import dynamic from "next/dynamic"
import ProductsList from "./products/products-list"
import { auth } from "@/lib/auth/auth"

const CartFixedButton = dynamic(() => import("./cart/cart-fixed-button"), {
  ssr: false,
})

const Shop = async () => {
  const session = await auth()

  return (
    <>
      <header className='flex items-center justify-between mb-8 bg-emerald-100 p-4 rounded-md'>
        <p className='text-sm text-muted-foreground'>
          Elige entre nuestra variedad semanal de platos. Cambiamos el menú cada
          lunes, así que si te gusta algo, pídelo antes de que acabe el domingo.
        </p>
      </header>

      <ProductsList />

      {session?.user && <CartFixedButton />}
    </>
  )
}

export default Shop

import dynamic from "next/dynamic"
import ProductsList from "./products/products-list"
import { getCategories } from "@/data/categories"
import HeaderShop from "./header-shop"
import ButtonsInfoShop from "./buttons-info-shop"

const CartFixedButton = dynamic(() => import("./cart/cart-fixed-button"), {
  ssr: false,
})

const Shop = async () => {
  const categories = await getCategories({
    include: {
      products: {
        where: {
          show: true,
        },
        include: {
          categories: true,
        },
      },
      promotions: true,
    },
  })

  return (
    <>
      <HeaderShop />
      <ButtonsInfoShop />

      <div className='flex items-center justify-between mb-8 bg-emerald-100 p-4 rounded-md w-full max-w-3xl mx-auto'>
        <p className='text-sm text-muted-foreground'>
          Elige entre nuestra variedad semanal de platos. Cambiamos el menú cada
          lunes, así que si te gusta algo, pídelo antes de que acabe el domingo.
        </p>
      </div>

      <div className='w-full max-w-3xl mx-auto p-4'>
        <ProductsList initialCategories={categories} />
      </div>

      <CartFixedButton />
    </>
  )
}

export default Shop

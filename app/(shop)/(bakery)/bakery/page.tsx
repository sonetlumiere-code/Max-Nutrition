import dynamic from "next/dynamic"
import { getCategories } from "@/data/categories"
import ButtonsInfoShop from "@/components/shop/buttons-info-shop"
import ProductsList from "@/components/shop/products/products-list"
import BannerShop from "@/components/shop/banner-shop"
import { ShopCategory } from "@prisma/client"
import { getShop } from "@/data/shops"

const CartFixedButton = dynamic(
  () => import("@/components/shop/cart/cart-fixed-button"),
  {
    ssr: false,
  }
)

const BakeryShopPage = async () => {
  const shopCategory = ShopCategory.BAKERY

  const shop = getShop({
    where: {
      shopCategory,
    },
  })

  if (!shop) {
    return <h1>Tienda no encontrada.</h1>
  }

  const categories = await getCategories({
    where: { shopCategory },
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
      <BannerShop
        title='Pastelería saludable, directamente a tu casa'
        description='Y lo mejor ¡Todo sin gluten!'
        img='/img/bakery-banner.jpg'
      />

      <ButtonsInfoShop shopCategory={shopCategory} />

      <div className='flex items-center justify-between mb-8 bg-emerald-100 p-4 rounded-md w-full max-w-3xl mx-auto'>
        <p className='text-sm text-muted-foreground'>
          Elige entre nuestra variedad semanal de platos. Cambiamos el menú cada
          lunes, así que si te gusta algo, pídelo antes de que acabe el domingo.
        </p>
      </div>

      <div className='w-full max-w-3xl mx-auto p-4'>
        <ProductsList
          initialCategories={categories}
          shopCategory={shopCategory}
        />
      </div>

      <CartFixedButton />
    </>
  )
}

export default BakeryShopPage

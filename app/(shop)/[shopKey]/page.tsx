import { getShop } from "@/data/shops"
import dynamic from "next/dynamic"
import { getCategories } from "@/data/categories"
import ButtonsInfoShop from "@/components/shop/buttons-info-shop"
import ProductsList from "@/components/shop/products/products-list"
import BannerShop from "@/components/shop/banner-shop"
import { redirect } from "next/navigation"

const CartFixedButton = dynamic(
  () => import("@/components/shop/cart/cart-fixed-button"),
  {
    ssr: false,
  }
)

interface ShopPageProps {
  params: {
    shopKey: string
  }
}

const ShopPage = async ({ params }: ShopPageProps) => {
  const { shopKey } = params

  const shop = await getShop({
    where: { key: shopKey, isActive: true },
  })

  if (!shop) {
    redirect("/")
  }

  const { shopCategory } = shop

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
        title={shop.title}
        description={shop.description}
        img={
          shop.bannerImage
            ? `${process.env.NEXT_PUBLIC_CLOUDINARY_BASE_URL}/${shop.bannerImage}`
            : "/img/foods-banner.jpg"
        }
      />

      <ButtonsInfoShop shopCategory={shopCategory} />

      {shop.message && (
        <div className='flex items-center justify-between mb-8 bg-emerald-100 p-4 rounded-md w-full max-w-3xl mx-auto'>
          <p className='text-sm text-muted-foreground'>{shop.message}</p>
        </div>
      )}

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

export default ShopPage

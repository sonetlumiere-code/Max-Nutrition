import { getShop } from "@/data/shops"
import { getCategories } from "@/data/categories"
import ButtonsInfoShop from "@/components/shop/buttons-info-shop"
import ProductsList from "@/components/shop/products/products-list"
import BannerShop from "@/components/shop/banner-shop"
import { redirect } from "next/navigation"
import { getOperationalHoursMessage } from "@/helpers/helpers"
import {
  MENSAJE_SIN_PEDIDOS,
  getShopOrderingState,
} from "@/helpers/shop-ordering"
import CartFixedButton from "@/components/shop/cart/cart-fixed-button.client"

interface ShopPageProps {
  params: Promise<{
    shopKey: string
  }>
}

const ShopPage = async (props: ShopPageProps) => {
  const params = await props.params;
  const { shopKey } = params

  const shop = await getShop({
    where: { key: shopKey, isActive: true },
    include: { operationalHours: true },
  })

  if (!shop) {
    return redirect("/")
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

  const estadoPedidos = getShopOrderingState(shop)

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

      <div className='space-y-3 mb-3'>
        {shop.message && (
          <div className='flex items-center justify-between bg-emerald-100 p-4 rounded-md w-full max-w-3xl mx-auto'>
            <p className='text-sm text-muted-foreground'>{shop.message}</p>
          </div>
        )}

        {!estadoPedidos.puedePedir && (
          <div className='flex items-center justify-between bg-red-100 p-4 rounded-md w-full max-w-3xl mx-auto'>
            <p className='text-sm text-muted-foreground'>
              {estadoPedidos.motivo === "no-toma-pedidos"
                ? MENSAJE_SIN_PEDIDOS
                : `La tienda no está disponible en este momento. Podrás realizar pedidos ${getOperationalHoursMessage(
                    shop.operationalHours ?? []
                  )}.`}
            </p>
          </div>
        )}
      </div>

      <div className='w-full max-w-3xl mx-auto p-4'>
        <ProductsList
          initialCategories={categories}
          shopCategory={shopCategory}
        />
      </div>

      {estadoPedidos.puedePedir && <CartFixedButton />}
    </>
  )
}

export default ShopPage

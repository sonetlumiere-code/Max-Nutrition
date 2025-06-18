import Link from "next/link"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { getCustomer } from "@/data/customer"
import { buttonVariants } from "@/components/ui/button"
import dynamic from "next/dynamic"
import { redirect } from "next/navigation"
import { getShopSettings } from "@/data/shop-settings"
import { getShopBranches } from "@/data/shop-branches"
import { DEFAULT_REDIRECT_SHOP } from "@/routes"
import { getShop } from "@/data/shops"
import { isShopCurrentlyAvailable } from "@/helpers/helpers"
import { verifySession } from "@/lib/auth/verify-session"

const Checkout = dynamic(() => import("@/components/shop/checkout/checkout"), {
  ssr: false,
})

const shopSettingsId = process.env.SHOP_SETTINGS_ID

interface CheckoutPageProps {
  params: {
    shopKey: string
  }
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { shopKey } = params

  const shop = await getShop({
    where: { key: shopKey, isActive: true },
    include: { operationalHours: true },
  })

  if (!shop) {
    return redirect(DEFAULT_REDIRECT_SHOP)
  }

  if (!shopSettingsId) {
    console.warn("Es necesario el ID de la configuración de tienda")
    return redirect(`/${shop.key}` || DEFAULT_REDIRECT_SHOP)
  }

  const isShopAvailable = isShopCurrentlyAvailable(shop.operationalHours)

  if (!isShopAvailable) {
    return redirect(DEFAULT_REDIRECT_SHOP)
  }

  const session = await verifySession()

  if (!session) {
    if (shop.key) {
      return redirect(`/${shop.key}`)
    }
    return redirect(DEFAULT_REDIRECT_SHOP)
  }

  const [customer, shopSettings, shopBranches] = await Promise.all([
    getCustomer({
      where: {
        userId: session?.user.id,
      },
      include: {
        addresses: true,
        user: {
          select: {
            email: true,
            name: true,
          },
        },
        orders: {
          orderBy: {
            createdAt: "desc",
          },
          include: {
            address: true,
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    }),
    getShopSettings({
      where: { id: shopSettingsId },
      include: {
        shippingSettings: true,
      },
    }),
    getShopBranches({
      where: { isActive: true },
      include: {
        operationalHours: true,
      },
    }),
  ])

  if (!customer || !shopSettings) {
    return redirect(`/${shop.key}` || DEFAULT_REDIRECT_SHOP)
  }

  return (
    <div className='w-full max-w-3xl mx-auto pt-5 px-4 md:px-6'>
      <div className='flex items-start mb-6'>
        <Link
          href={`/${shop.key}` || DEFAULT_REDIRECT_SHOP}
          className={cn(buttonVariants({ variant: "ghost" }), "")}
        >
          <>
            <Icons.chevronLeft className='mr-2 h-4 w-4' />
            Volver a tienda
          </>
        </Link>
      </div>

      <Checkout
        customer={customer}
        shopSettings={shopSettings}
        shopBranches={shopBranches}
        shop={shop}
      />
    </div>
  )
}

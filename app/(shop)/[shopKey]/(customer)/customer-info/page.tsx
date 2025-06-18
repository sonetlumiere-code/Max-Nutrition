import { Icons } from "@/components/icons"
import CustomerAddresses from "@/components/shop/customer/info/address/list/customer-addresses"
import CustomerPersonalInfo from "@/components/shop/customer/info/personal-info/customer-personal-info"
import { buttonVariants } from "@/components/ui/button"
import { getCustomer } from "@/data/customer"
import { getShop } from "@/data/shops"
import { verifySession } from "@/lib/auth/verify-session"
import { cn } from "@/lib/utils"
import { DEFAULT_REDIRECT_SHOP } from "@/routes"
import Link from "next/link"
import { redirect } from "next/navigation"

interface CustomerInfoPageProps {
  params: {
    shopKey: string
  }
}

const CustomerInfoPage = async ({ params }: CustomerInfoPageProps) => {
  const session = await verifySession()

  const { shopKey } = params

  const shop = await getShop({
    where: { key: shopKey, isActive: true },
  })

  if (!shop) {
    return redirect(DEFAULT_REDIRECT_SHOP)
  }

  const customer = await getCustomer({
    where: {
      userId: session?.user.id,
    },
    include: {
      addresses: {
        orderBy: {
          createdAt: "asc",
        },
      },
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
  })

  if (!customer) {
    return redirect(DEFAULT_REDIRECT_SHOP)
  }

  return (
    <div className='space-y-6 w-full max-w-3xl mx-auto pt-5 px-4 md:px-6'>
      <div className='flex items-start'>
        <Link
          href={`/${shop.key}`}
          className={cn(buttonVariants({ variant: "ghost" }), "")}
        >
          <>
            <Icons.chevronLeft className='mr-2 h-4 w-4' />
            Volver a tienda
          </>
        </Link>
      </div>

      {customer && (
        <>
          <CustomerPersonalInfo customer={customer} />
          <CustomerAddresses customer={customer} shop={shop} />
        </>
      )}
    </div>
  )
}

export default CustomerInfoPage

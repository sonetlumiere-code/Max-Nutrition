import Link from "next/link"
import { redirect } from "next/navigation"
import { Icons } from "@/components/icons"
import SubscriptionCard from "@/components/shop/customer/subscriptions/subscription-card"
import { buttonVariants } from "@/components/ui/button"
import { getCustomer } from "@/data/customer"
import { getShop } from "@/data/shops"
import { verifySession } from "@/lib/auth/verify-session"
import prisma from "@/lib/db/db"
import { cn } from "@/lib/utils"
import { DEFAULT_REDIRECT_SHOP } from "@/routes"

interface SubscriptionsPageProps {
  params: Promise<{ shopKey: string }>
}

export default async function SubscriptionsPage(props: SubscriptionsPageProps) {
  const { shopKey } = await props.params
  const session = await verifySession()

  if (!session?.user) {
    return redirect(DEFAULT_REDIRECT_SHOP)
  }

  const shop = await getShop({ where: { key: shopKey, isActive: true } })

  if (!shop) {
    return redirect(DEFAULT_REDIRECT_SHOP)
  }

  const customer = await getCustomer({ where: { userId: session.user.id } })

  if (!customer) {
    return redirect(DEFAULT_REDIRECT_SHOP)
  }

  const subscriptions = await prisma.subscription.findMany({
    where: { customerId: customer.id, shopId: shop.id },
    include: { items: { include: { product: { select: { name: true } } } } },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className='mx-auto w-full max-w-3xl space-y-6 px-4 pt-5 md:px-6'>
      <div className='flex items-start'>
        <Link
          href={`/${shop.key}`}
          className={cn(buttonVariants({ variant: "ghost" }))}
        >
          <Icons.chevronLeft className='mr-2 h-4 w-4' />
          Volver a tienda
        </Link>
      </div>

      <div>
        <h1 className='text-2xl font-semibold'>Mi pedido semanal</h1>
        <p className='mt-1 text-sm text-muted-foreground'>
          Preparamos tu pedido todas las semanas el día que elijas. Podés
          pausarlo o cancelarlo cuando quieras.
        </p>
      </div>

      {subscriptions.length ? (
        <div className='grid gap-4'>
          {subscriptions.map((subscription) => (
            <SubscriptionCard
              key={subscription.id}
              subscription={{
                id: subscription.id,
                weekday: subscription.weekday,
                isActive: subscription.isActive,
                shippingMethod: subscription.shippingMethod,
                amount: subscription.amount,
                preapprovalStatus: subscription.preapprovalStatus,
                items: subscription.items.map((item) => ({
                  id: item.id,
                  quantity: item.quantity,
                  withSalt: item.withSalt,
                  productName: item.product?.name ?? "Producto",
                })),
              }}
            />
          ))}
        </div>
      ) : (
        <div className='rounded-lg border border-dashed p-10 text-center'>
          <p className='text-sm text-muted-foreground'>
            Todavía no tenés un pedido semanal. Podés crearlo desde cualquiera
            de tus pedidos anteriores, con la opción{" "}
            <strong>Repetir todas las semanas</strong>.
          </p>
          <Link
            href={`/${shop.key}/customer-orders-history`}
            className={cn(buttonVariants({ variant: "outline" }), "mt-4")}
          >
            Ver mis pedidos
          </Link>
        </div>
      )}
    </div>
  )
}

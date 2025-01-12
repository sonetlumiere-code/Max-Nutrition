import { redirect } from "next/navigation"
import { getOrder } from "@/data/orders"
import OrderConfirmed from "@/components/shop/order-confirmed/order-confirmed"
import { PopulatedOrder } from "@/types/types"

interface PageProps {
  params: { orderId: string }
}

export default async function OrderConfirmedPage({ params }: PageProps) {
  const { orderId } = params

  if (!orderId) {
    redirect("/shop")
  }

  try {
    const res = await getOrder(orderId)
    if (!res.success) {
      redirect("/shop")
    }

    return <OrderConfirmed order={res.order} />
  } catch (error) {
    console.error("Error fetching order data:", error)
    redirect("/shop")
  }
}

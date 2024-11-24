import Orders from "@/components/dashboard/orders/orders"
import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"

export default async function OrdersPage() {
  const session = await auth()

  if (session?.user.role !== "ADMIN") {
    return redirect("/")
  }

  return <Orders />
}

import Orders from "@/components/dashboard/orders/orders"
import { hasPermission } from "@/helpers/helpers"
import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"

export default async function OrdersPage() {
  const session = await auth()
  const user = session?.user

  if (!user) {
    redirect("/")
  }

  if (!hasPermission(user, "view:orders")) {
    return redirect("/")
  }

  return <Orders />
}

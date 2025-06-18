import Orders from "@/components/dashboard/orders/orders"
import { hasPermission } from "@/helpers/helpers"
import { redirect } from "next/navigation"
import { DEFAULT_REDIRECT_DASHBOARD } from "@/routes"
import { verifySession } from "@/lib/auth/verify-session"

export default async function OrdersPage() {
  const session = await verifySession()
  const user = session?.user

  if (!user) {
    return redirect("/")
  }

  if (!hasPermission(user, "view:orders")) {
    return redirect(DEFAULT_REDIRECT_DASHBOARD)
  }

  return <Orders />
}

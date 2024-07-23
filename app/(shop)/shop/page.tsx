import { Icons } from "@/components/icons"
import SignOutButton from "@/components/sign-out-button"
import { Button, buttonVariants } from "@/components/ui/button"
import { auth } from "@/lib/auth/auth"
import { cn } from "@/lib/utils"
import { Role } from "@prisma/client"
import Link from "next/link"
import Shop from "@/components/shop/shop"
import { CartProvider } from "@/components/cart-provider"

const ShopPage = async () => {
  const session = await auth()
  const isAdmin = session?.user.role === Role.ADMIN

  return (
    <CartProvider>
      <Shop />
    </CartProvider>
  )
}

export default ShopPage

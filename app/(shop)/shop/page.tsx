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
    <>
      {/* <div>
        <nav>
          {isAdmin ? (
            <Link
              href='/welcome'
              className={cn(
                buttonVariants({
                  variant: "secondary",
                }),
                ""
              )}
            >
              <Icons.layoutDashboard className='w-4 h-4 mr-2' />
              Admin panel
            </Link>
          ) : (
            <Icons.shoppingCart className='w-4 h-4' />
          )}
        </nav>
        Shop
        {JSON.stringify(session, null, 4)}
        {session?.user ? (
          <SignOutButton>
            <Button type='button'>Cerrar sesión</Button>
          </SignOutButton>
        ) : (
          <Link
            href='/login'
            className={cn(
              buttonVariants({
                variant: "secondary",
              }),
              ""
            )}
          >
            Iniciar sesion
          </Link>
        )}
      </div> */}
      <CartProvider>
        <Shop />
      </CartProvider>
    </>
  )
}

export default ShopPage

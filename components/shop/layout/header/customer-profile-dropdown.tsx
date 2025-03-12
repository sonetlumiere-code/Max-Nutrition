import { Icons } from "@/components/icons"
import SignOutButton from "@/components/sign-out-button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import UserAvatar from "@/components/user-avatar"
import { getRouteByShopCategory } from "@/helpers/helpers"
import { ShopCategory, RoleGroup } from "@prisma/client"
import { Session } from "next-auth"
import Link from "next/link"

type ProfileDropdownProps = {
  session: Session | null
  shopCategory: ShopCategory
}

const CustomerProfileDropdown = ({
  session,
  shopCategory,
}: ProfileDropdownProps) => {
  const isStaff = session?.user.role?.group === RoleGroup.STAFF

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <UserAvatar user={session?.user} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        {isStaff && (
          <>
            <Link href='/welcome'>
              <DropdownMenuItem>
                <Icons.layoutDashboard className='w-4 h-4 mr-2' /> Admin panel
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
          </>
        )}
        <Link href={`${getRouteByShopCategory(shopCategory)}/customer-info`}>
          <DropdownMenuItem>
            <Icons.user className='w-4 h-4 mr-2' /> Perfil
          </DropdownMenuItem>
        </Link>
        <Link
          href={`${getRouteByShopCategory(
            shopCategory
          )}/customer-orders-history`}
        >
          <DropdownMenuItem>
            <Icons.scrollText className='w-4 h-4 mr-2' /> Pedidos
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <SignOutButton>
          <DropdownMenuItem>
            <Icons.logOut className='w-4 h-4 mr-2' /> Cerrar sesión
          </DropdownMenuItem>
        </SignOutButton>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default CustomerProfileDropdown

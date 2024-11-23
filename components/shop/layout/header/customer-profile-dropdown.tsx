import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Session } from "next-auth"
import SignOutButton from "@/components/sign-out-button"
import Link from "next/link"
import UserAvatar from "@/components/user-avatar"
import { Icons } from "@/components/icons"
import { Role } from "@prisma/client"

type ProfileDropdownProps = {
  session: Session | null
}

const CustomerProfileDropdown = ({ session }: ProfileDropdownProps) => {
  const isAdmin = session?.user.role === Role.ADMIN

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <UserAvatar user={session?.user} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        {isAdmin && (
          <>
            <Link href='/orders'>
              <DropdownMenuItem>
                <Icons.layoutDashboard className='w-4 h-4 mr-2' /> Admin panel
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
          </>
        )}
        <Link href='/customer-info'>
          <DropdownMenuItem>
            <Icons.user className='w-4 h-4 mr-2' /> Mis datos
          </DropdownMenuItem>
        </Link>
        <Link href='/customer-orders-history'>
          <DropdownMenuItem>
            <Icons.scrollText className='w-4 h-4 mr-2' /> Mis Pedidos
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

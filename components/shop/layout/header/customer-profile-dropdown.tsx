import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Session } from "next-auth"
import { ScrollText, User } from "lucide-react"
import SignOutButton from "@/components/sign-out-button"
import Link from "next/link"
import UserAvatar from "@/components/user-avatar"
import { Icons } from "@/components/icons"

type ProfileDropdownProps = {
  session: Session | null
}

const CustomerProfileDropdown = ({ session }: ProfileDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <UserAvatar user={session?.user} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <Link href='/customer-info'>
          <DropdownMenuItem>
            <User className='w-4 h-4 mr-2' /> Mis datos
          </DropdownMenuItem>
        </Link>
        <Link href='/customer-orders-history'>
          <DropdownMenuItem>
            <ScrollText className='w-4 h-4 mr-2' /> Mis Pedidos
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

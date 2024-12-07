import { Icons } from "@/components/icons"
import SignOutButton from "@/components/sign-out-button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import UserAvatar from "@/components/user-avatar"
import { auth } from "@/lib/auth/auth"
import Link from "next/link"

const AdminProfileDropdown = async () => {
  const session = await auth()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <UserAvatar user={session?.user} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href={"/shop-settings"}>
          <DropdownMenuItem>
            <Icons.settings className='w-4 h-4 mr-2' />
            Configuración
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <SignOutButton>
          <DropdownMenuItem className='cursor-pointer'>
            <Icons.logOut className='w-4 h-4 mr-2' />
            Cerrar sesión
          </DropdownMenuItem>
        </SignOutButton>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default AdminProfileDropdown

/* eslint-disable @next/next/no-img-element */

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Session } from "next-auth"
import { LogOut, ScrollText, User } from "lucide-react"
import SignOutButton from "@/components/sign-out-button"
import Link from "next/link"

type ProfileDropdownProps = {
  session: Session | null
}

const ProfileDropdown = ({ session }: ProfileDropdownProps) => {
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className='h-9 w-9 cursor-pointer'>
            <AvatarImage src='/placeholder-user.jpg' />
            <AvatarFallback>
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name ?? "User"}
                />
              ) : (
                <User className='w-6 h-6' />
              )}
            </AvatarFallback>
          </Avatar>
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
              <LogOut className='w-4 h-4 mr-2' /> Cerrar sesión
            </DropdownMenuItem>
          </SignOutButton>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

export default ProfileDropdown

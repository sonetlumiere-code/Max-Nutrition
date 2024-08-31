/* eslint-disable @next/next/no-img-element */
"use client"

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
import { useState } from "react"
import CustomerOrderHistory from "../customer/orders-history/customer-orders-history"
import CustomerInfo from "../customer/info/customer-info"

type ProfileDropdownProps = {
  session: Session | null
}

const ProfileDropdown = ({ session }: ProfileDropdownProps) => {
  const [openOrdersHistory, setOpenOrdersHistory] = useState(false)
  const [openCustomerInfo, setOpenCustomerInfo] = useState(false)

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
          <DropdownMenuItem onClick={() => setOpenCustomerInfo(true)}>
            <User className='w-4 h-4 mr-2' /> Mis datos
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenOrdersHistory(true)}>
            <ScrollText className='w-4 h-4 mr-2' /> Pedidos
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <SignOutButton>
            <DropdownMenuItem>
              <LogOut className='w-4 h-4 mr-2' /> Cerrar sesión
            </DropdownMenuItem>
          </SignOutButton>
        </DropdownMenuContent>
      </DropdownMenu>

      <CustomerOrderHistory
        open={openOrdersHistory}
        setOpen={setOpenOrdersHistory}
      />

      <CustomerInfo open={openCustomerInfo} setOpen={setOpenCustomerInfo} />
    </>
  )
}

export default ProfileDropdown

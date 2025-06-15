"use client"

import { useSession } from "next-auth/react"
import CustomerProfileDropdown from "./customer-profile-dropdown"
import AuthButton from "./auth-button"
import { PopulatedShop } from "@/types/types"
import { Skeleton } from "@/components/ui/skeleton"

const CustomerAuth = ({ shop }: { shop: PopulatedShop }) => {
  const { data: session, status } = useSession()

  return status === "loading" ? (
    <Skeleton className='rounded-full w-10 h-10' />
  ) : (
    <>
      {session?.user ? (
        <CustomerProfileDropdown session={session} shop={shop} />
      ) : (
        <AuthButton />
      )}
    </>
  )
}

export default CustomerAuth

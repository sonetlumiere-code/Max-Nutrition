"use client"

import { Icons } from "@/components/icons"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"

const AuthButton = () => {
  const pathname = usePathname()

  return (
    <Link
      href={`/login?redirectTo=${encodeURIComponent(pathname)}`}
      className={cn(buttonVariants({ variant: "outline" }), "")}
    >
      <Icons.user className='w-5 h-5 mr-2' /> Ingresar
    </Link>
  )
}

export default AuthButton

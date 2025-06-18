/* eslint-disable @next/next/no-img-element */
import { verifySession } from "@/lib/auth/verify-session"
import { RoleGroup } from "@prisma/client"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await verifySession()

  const isStaff = session?.user.role?.group === RoleGroup.STAFF

  if (!isStaff) {
    return redirect("/")
  }

  return (
    <div className='h-full flex items-center justify-center'>
      <img
        src='img/logo-mxm.svg'
        alt='MXM Máxima Nutrición'
        className='opacity-30 w-72'
      />
    </div>
  )
}

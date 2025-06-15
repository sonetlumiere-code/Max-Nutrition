import { ReactNode } from "react"
import SideNavDashboard from "@/components/dashboard/layout/header/sidenav-dashboard"
import HeaderDashboard from "@/components/dashboard/layout/header/header-dashboard"
import { auth } from "@/lib/auth/auth"

interface DashboardLayoutProps {
  children: ReactNode
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const session = await auth()

  return (
    <div className='grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]'>
      <SideNavDashboard session={session} />
      <div className='flex flex-col'>
        <HeaderDashboard session={session} />
        <main className='flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6'>
          {children}
        </main>
      </div>
    </div>
  )
}

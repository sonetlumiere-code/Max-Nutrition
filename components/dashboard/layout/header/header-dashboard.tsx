import AdminProfileDropdown from "./admin-profile-dropdown"
import SheetSideNavDashboard from "./sheet-sidenav-dashboard"
import { Session } from "next-auth"

type HeaderDashboardProps = {
  session: Session | null
}

export default async function HeaderDashboard({
  session,
}: HeaderDashboardProps) {
  return (
    <header className='flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6'>
      <SheetSideNavDashboard session={session} />
      <div className='w-full flex-1'>
        {/* <div className='relative'>
          <Icons.search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            type='search'
            placeholder='Buscar recetas...'
            className='w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3'
          />
        </div> */}
      </div>
      <AdminProfileDropdown />
    </header>
  )
}

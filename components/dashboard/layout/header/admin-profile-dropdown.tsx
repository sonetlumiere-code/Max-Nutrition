import { Icons } from "@/components/icons"
import SignOutButton from "@/components/sign-out-button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import UserAvatar from "@/components/user-avatar"
import { Session } from "next-auth"

type AdminProfileDropdownProps = {
  session: Session | null
}

const AdminProfileDropdown = ({ session }: AdminProfileDropdownProps) => {
  const userName = session?.user?.name || ""
  const userEmail = session?.user.email || ""
  const roleName = session?.user?.role?.name || "Sin rol"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <UserAvatar user={session?.user} />
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-80' align='end'>
        <div className='flex flex-col space-y-2 p-2'>
          <div className='bg-secondary -mx-2 -mt-2 p-4 rounded-t-lg'>
            <div className='flex items-center space-x-4'>
              <UserAvatar user={session?.user} />
              <div className='space-y-1'>
                <h4 className='text-sm font-semibold'>{userName}</h4>
                <p className='text-xs text-muted-foreground'>{userEmail}</p>
              </div>
            </div>
            {/* <div className='flex space-x-2 mt-4'>
              <Button
                size='icon'
                variant='secondary'
                className='rounded-full bg-blue-700 hover:bg-blue-800 text-white'
              >
                <Icons.key className='h-4 w-4' />
              </Button>
              <Button
                size='icon'
                variant='secondary'
                className='rounded-full bg-blue-700 hover:bg-blue-800 text-white'
              >
                <Icons.creditCard className='h-4 w-4' />
              </Button>
              <Button
                size='icon'
                variant='secondary'
                className='rounded-full bg-blue-700 hover:bg-blue-800 text-white'
              >
                <Icons.mapPin className='h-4 w-4' />
              </Button>
            </div> */}
          </div>

          <Badge
            className='w-full flex justify-center items-center py-3'
            variant='outline'
          >
            {roleName}
          </Badge>

          <DropdownMenuSeparator />

          <div>
            {/* <DropdownMenuItem className='px-4 py-3 cursor-pointer'>
              <Icons.user className='mr-2 h-4 w-4' />
              <span>Personalizar perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem className='px-4 py-3 cursor-pointer'>
              <Icons.settings className='mr-2 h-4 w-4' />
              <span>Configuración</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator /> */}

            <SignOutButton>
              <DropdownMenuItem className='cursor-pointer items-center justify-center w-full py-3'>
                <Icons.logOut className='w-4 h-4 mr-2 text-destructive' />
                <p className='text-destructive'>Cerrar sesión</p>
              </DropdownMenuItem>
            </SignOutButton>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default AdminProfileDropdown

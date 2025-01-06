import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { PopulatedCustomer } from "@/types/types"
import { ColumnDef } from "@tanstack/react-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import DeleteCustomer from "@/components/dashboard/customers/delete-customer/delete-customer"
import UserAvatar from "@/components/user-avatar"

export const columns: ColumnDef<PopulatedCustomer>[] = [
  {
    id: "image",
    meta: "Imagen",
    header: () => <span className='sr-only'>Imagen</span>,
    cell: ({ row }) => {
      const user = row.original.user
      return (
        <div className='flex justify-center items-center'>
          {user ? (
            <UserAvatar user={user} />
          ) : (
            <Icons.circleUser className='h-11 w-11 text-muted-foreground' />
          )}
        </div>
      )
    },
    enableSorting: false,
  },
  {
    id: "name",
    meta: "Nombre",
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Nombre
        <Icons.caretSortIcon className='ml-2 h-4 w-4' />
      </Button>
    ),
    cell: ({ row }) => {
      const customerName = row.original.name || row.original.user?.name
      return (
        <div className='ml-4'>
          <div className='font-medium'>{customerName}</div>
        </div>
      )
    },
  },
  {
    id: "email",
    meta: "Email",
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Email
        <Icons.caretSortIcon className='ml-2 h-4 w-4' />
      </Button>
    ),
    cell: ({ row }) => {
      const customerEmail = row.original.user?.email || "-"
      return (
        <div className='ml-4'>
          <div className='font-medium'>{customerEmail}</div>
        </div>
      )
    },
  },
  {
    id: "phone",
    meta: "Teléfono",
    accessorKey: "phone",
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Teléfono
        <Icons.caretSortIcon className='ml-2 h-4 w-4' />
      </Button>
    ),
    cell: ({ row }) => {
      const customerPhone = row.original.phone
      return (
        <>
          {customerPhone ? (
            <Button variant='outline' size='default'>
              {customerPhone}
              <Icons.messageSquareMore className='h-4 w-4 ml-1' />
            </Button>
          ) : (
            "-"
          )}
        </>
      )
    },
  },
  {
    id: "birthdate",
    meta: "Fecha de nacimiento",
    accessorKey: "birthdate",
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Fecha de nacimiento
        <Icons.caretSortIcon className='ml-2 h-4 w-4' />
      </Button>
    ),
    cell: ({ row }) => {
      const birthdate = row.original.birthdate?.toLocaleDateString() || "-"
      return (
        <div className='ml-4'>
          <div className='font-medium'>{birthdate}</div>
        </div>
      )
    },
  },
  {
    id: "createdAt",
    meta: "Fecha de registro",
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Fecha de registro
        <Icons.caretSortIcon className='ml-2 h-4 w-4' />
      </Button>
    ),
    cell: ({ row }) => {
      const createdAt = row.original.createdAt?.toLocaleDateString() || "-"
      return (
        <div className='ml-4'>
          <div className='font-medium'>{createdAt}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "actions",
    meta: "Acciones",
    header: () => <p className='text-right'>Acciones</p>,
    cell: ({ row }) => {
      const customer = row.original as PopulatedCustomer
      return (
        <div className='text-right'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-haspopup='true' size='icon' variant='ghost'>
                <Icons.moreHorizontal className='h-4 w-4' />
                <span className='sr-only'>Mostrar menú</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <Link href={`customers/${customer.id}`}>
                <DropdownMenuItem>
                  <Icons.eye className='h-4 w-4 mr-2' /> Ver
                </DropdownMenuItem>
              </Link>
              <Link href={`customers/edit-customer/${customer.id}`}>
                <DropdownMenuItem>
                  <Icons.pencil className='h-4 w-4 mr-2' /> Editar
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <DeleteCustomer customer={customer} />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]

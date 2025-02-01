"use client"

import { getPermissionsKeys } from "@/helpers/helpers"
import { useMediaQuery } from "@/hooks/use-media-query"
import { PopulatedUser } from "@/types/types"
import { useSession } from "next-auth/react"
import { useEffect, useMemo, useState } from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTablePagination } from "@/components/ui/data-table-pagination"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "@/components/ui/data-table-view-options"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { Badge } from "@/components/ui/badge"
import UserAvatar from "@/components/user-avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { format } from "date-fns"

interface UsersDataTableProps {
  users: Omit<PopulatedUser, "password">[]
}

const UsersDataTable = ({ users }: UsersDataTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([])
  const [filtering, setFiltering] = useState<string>("")

  const { data: session } = useSession()

  const userPermissionsKeys = getPermissionsKeys(
    session?.user.role?.permissions
  )

  const isDesktop = useMediaQuery("(min-width: 768px)")

  const columns: ColumnDef<Omit<PopulatedUser, "password">>[] = useMemo(
    () => [
      {
        id: "image",
        meta: "Imagen",
        header: () => <span className='sr-only'>Imagen</span>,
        cell: ({ row }) => {
          const user = row.original
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
          const userName = row.original.name
          return (
            <div className='ml-4'>
              <div className='font-medium'>{userName}</div>
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
          const userEmail = row.original.email || "-"
          return (
            <div className='ml-4'>
              <div className='font-medium'>{userEmail}</div>
            </div>
          )
        },
      },
      {
        id: "emailVerified",
        meta: "Email verificado",
        accessorKey: "emailVerified",
        header: ({ column }) => (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Email verificado
            <Icons.caretSortIcon className='ml-2 h-4 w-4' />
          </Button>
        ),
        cell: ({ row }) => {
          const emailVerified = row.original.emailVerified
          return (
            <div className='ml-4'>
              <div className='font-medium'>
                {emailVerified ? (
                  <Badge className='bg-emerald-500 hover:bg-emerald-500/80'>
                    Verificado
                  </Badge>
                ) : (
                  <Badge variant='destructive'>No verificado</Badge>
                )}
              </div>
            </div>
          )
        },
      },
      {
        id: "role",
        meta: "Rol",
        accessorKey: "role.name",
        header: ({ column }) => (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Rol
            <Icons.caretSortIcon className='ml-2 h-4 w-4' />
          </Button>
        ),
        cell: ({ row }) => {
          const roleName = row.original.role?.name
          return (
            <div className='ml-4'>
              <div className='font-medium'>
                <Badge>{roleName}</Badge>
              </div>
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
          const createdAt = row.original.createdAt
            ? format(new Date(row.original.createdAt), "dd/MM/yyyy")
            : "-"

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
          if (userPermissionsKeys.includes("update:users")) {
            const user = row.original
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
                    {userPermissionsKeys.includes("update:users") && (
                      <Link href={`users/edit-user/${user.id}`}>
                        <DropdownMenuItem>
                          <Icons.pencil className='h-4 w-4 mr-2' /> Editar
                        </DropdownMenuItem>
                      </Link>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )
          }
          return null
        },
      },
    ],
    [userPermissionsKeys]
  )

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
      globalFilter: filtering,
    },
    onGlobalFilterChange: setFiltering,
  })

  useEffect(() => {
    table.setColumnVisibility({
      shippingMethod: isDesktop,
      createdAt: isDesktop,
    })
  }, [isDesktop, table])

  return (
    <div className='grid gap-4'>
      <div className='flex items-center gap-2'>
        <Input
          placeholder='Filtrar'
          onChange={(e) => setFiltering(e.target.value)}
          className='max-w-xs'
        />
        <DataTableViewOptions table={table} />
      </div>
      <div className='rounded-md border'>
        <Table className='relative'>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  No hay resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className='flex items-center justify-between px-2 h-9'>
        <div className='flex items-center'>{/* Bulk Actions */}</div>
        <DataTablePagination table={table} setPageSize />
      </div>
    </div>
  )
}

export default UsersDataTable

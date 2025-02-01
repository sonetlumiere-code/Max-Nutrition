"use client"

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { useEffect, useMemo, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { DataTablePagination } from "@/components/ui/data-table-pagination"
import { DataTableViewOptions } from "@/components/ui/data-table-view-options"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { PopulatedCustomer } from "@/types/types"
import { ColumnDef } from "@tanstack/react-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import DeleteCustomer from "@/components/dashboard/customers/delete-customer/delete-customer"
import UserAvatar from "@/components/user-avatar"
import { useSession } from "next-auth/react"
import { getPermissionsKeys } from "@/helpers/helpers"
import { format } from "date-fns"

interface OrdersDataTableProps {
  customers: PopulatedCustomer[]
}

const CustomersDataTable = ({ customers }: OrdersDataTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([])
  const [filtering, setFiltering] = useState<string>("")

  const { data: session } = useSession()

  const userPermissionsKeys = getPermissionsKeys(
    session?.user.role?.permissions
  )

  const isDesktop = useMediaQuery("(min-width: 768px)")

  const columns: ColumnDef<PopulatedCustomer>[] = useMemo(
    () => [
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
          const birthdate = row.original.birthdate
          return (
            <div className='ml-4'>
              {birthdate ? (
                <div className='font-medium'>
                  {format(birthdate, "dd/MM/yyyy")}
                </div>
              ) : null}
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
          return (
            <div className='ml-4'>
              {createdAt ? (
                <div className='font-medium'>
                  {format(createdAt, "dd/MM/yyyy")}
                </div>
              ) : null}
            </div>
          )
        },
      },
      {
        accessorKey: "actions",
        meta: "Acciones",
        header: () => <p className='text-right'>Acciones</p>,
        cell: ({ row }) => {
          if (
            userPermissionsKeys.includes("update:customers") ||
            userPermissionsKeys.includes("delete:customers")
          ) {
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
                    {userPermissionsKeys.includes("view:customers") && (
                      <Link href={`customers/${customer.id}`}>
                        <DropdownMenuItem>
                          <Icons.eye className='h-4 w-4 mr-2' /> Ver
                        </DropdownMenuItem>
                      </Link>
                    )}
                    {userPermissionsKeys.includes("update:customers") && (
                      <Link href={`customers/edit-customer/${customer.id}`}>
                        <DropdownMenuItem>
                          <Icons.pencil className='h-4 w-4 mr-2' /> Editar
                        </DropdownMenuItem>
                      </Link>
                    )}
                    {userPermissionsKeys.includes("delete:customers") && (
                      <DropdownMenuItem>
                        <DeleteCustomer customer={customer} />
                      </DropdownMenuItem>
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
    data: customers,
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

export default CustomersDataTable

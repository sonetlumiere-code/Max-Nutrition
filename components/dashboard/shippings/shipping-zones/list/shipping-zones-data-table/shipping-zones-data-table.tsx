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
import { useEffect, useState } from "react"
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
import { ShippingZone } from "@prisma/client"
import { ColumnDef } from "@tanstack/react-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import DeleteShippingZone from "@/components/dashboard/shippings/shipping-zones/delete-shipping-zone/delete-shipping-zone"
import { useSession } from "next-auth/react"
import { getPermissionsKeys } from "@/helpers/helpers"

interface OrdersDataTableProps {
  shippingZones: ShippingZone[]
}

const ShippingZonesDataTable = ({ shippingZones }: OrdersDataTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([])
  const [filtering, setFiltering] = useState<string>("")

  const { data: session } = useSession()

  const userPermissionsKeys = getPermissionsKeys(
    session?.user.role?.permissions
  )

  const isDesktop = useMediaQuery("(min-width: 768px)")

  const columns: ColumnDef<ShippingZone>[] = [
    {
      id: "province",
      meta: "Provincia",
      accessorKey: "province",
      header: ({ column }) => (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Provincia
          <Icons.caretSortIcon className='ml-2 h-4 w-4' />
        </Button>
      ),
      cell: ({ row }) => {
        return (
          <div className='ml-4'>
            <div className='font-medium'>{row.getValue("province")}</div>
          </div>
        )
      },
    },
    {
      id: "municipality",
      meta: "Municipalidad",
      accessorKey: "municipality",
      header: ({ column }) => (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Municipalidad
          <Icons.caretSortIcon className='ml-2 h-4 w-4' />
        </Button>
      ),
      cell: ({ row }) => {
        return (
          <div className='ml-4'>
            <div className='font-medium'>{row.getValue("municipality")}</div>
          </div>
        )
      },
    },
    {
      id: "locality",
      meta: "Localidad",
      accessorKey: "locality",
      header: ({ column }) => (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Localidad
          <Icons.caretSortIcon className='ml-2 h-4 w-4' />
        </Button>
      ),
      cell: ({ row }) => {
        return (
          <div className='ml-4'>
            <div className='font-medium'>{row.getValue("locality")}</div>
          </div>
        )
      },
    },
    {
      id: "cost",
      meta: "Costo",
      accessorKey: "cost",
      header: ({ column }) => (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Costo
          <Icons.caretSortIcon className='ml-2 h-4 w-4' />
        </Button>
      ),
      cell: ({ row }) => {
        return (
          <div className='ml-4'>
            <div className='font-medium'>{row.getValue("cost")}</div>
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
          userPermissionsKeys.includes("update:shippingZones") ||
          userPermissionsKeys.includes("delete:shippingZones")
        ) {
          const shippingZone = row.original as ShippingZone
          return (
            <div className='text-right'>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button aria-haspopup='true' size='icon' variant='ghost'>
                    <Icons.moreHorizontal className='h-4 w-4' />
                    <span className='sr-only'>Mostrar menú</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                  {userPermissionsKeys.includes("update:shippingZones") && (
                    <Link
                      href={`shippings/edit-shipping-zone/${shippingZone.id}`}
                    >
                      <DropdownMenuItem>
                        <Icons.pencil className='w-4 h-4 mr-2' />
                        Editar
                      </DropdownMenuItem>
                    </Link>
                  )}
                  {userPermissionsKeys.includes("delete:shippingZones") && (
                    <DropdownMenuItem>
                      <DeleteShippingZone shippingZone={shippingZone} />
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
  ]

  const table = useReactTable({
    data: shippingZones,
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

export default ShippingZonesDataTable

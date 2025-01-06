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
import { columns } from "./columns"
import { Input } from "@/components/ui/input"
import { DataTablePagination } from "@/components/ui/data-table-pagination"
import { DataTableViewOptions } from "@/components/ui/data-table-view-options"
import { useMediaQuery } from "@/hooks/use-media-query"
import { ShippingZone } from "@prisma/client"

interface OrdersDataTableProps {
  shippingZones: ShippingZone[]
}

const ShippingZonesDataTable = ({ shippingZones }: OrdersDataTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([])
  const [filtering, setFiltering] = useState<string>("")

  const isDesktop = useMediaQuery("(min-width: 768px)")

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

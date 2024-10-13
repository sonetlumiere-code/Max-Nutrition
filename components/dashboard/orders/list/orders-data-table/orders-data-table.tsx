import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { Dispatch, SetStateAction, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { columns } from "./columns"
import { PopulatedOrder } from "@/types/types"
import { Input } from "@/components/ui/input"
import OrdersBulkActions from "./bulk-actions/orders-bulk-actions"
import { DataTablePagination } from "@/components/ui/data-table-pagination"
import { cn } from "@/lib/utils"
import { DataTableViewOptions } from "@/components/ui/data-table-view-options"

interface OrdersDataTableProps {
  orders: PopulatedOrder[]
  selectedOrder: PopulatedOrder | null
  setSelectedOrder: Dispatch<SetStateAction<PopulatedOrder | null>>
}

const OrdersDataTable = ({
  orders,
  selectedOrder,
  setSelectedOrder,
}: OrdersDataTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([])
  const [filtering, setFiltering] = useState<string>("")

  const table = useReactTable({
    data: orders,
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

  return (
    <div className='grid gap-4'>
      <div className='flex items-center'>
        <Input
          placeholder='Filtrar'
          onChange={(e) => setFiltering(e.target.value)}
          className='max-w-xs'
        />
        <DataTableViewOptions table={table} />
      </div>
      <div className='rounded-md border'>
        <Table>
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
                <TableRow
                  key={row.id}
                  onClick={() => setSelectedOrder(row.original)}
                  className={cn("cursor-pointer", {
                    "bg-muted/50": selectedOrder?.id === row.original.id,
                  })}
                >
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
        <div className='flex items-center'>
          <OrdersBulkActions table={table} />
        </div>
        <DataTablePagination table={table} setPageSize />
      </div>
    </div>
  )
}

export default OrdersDataTable

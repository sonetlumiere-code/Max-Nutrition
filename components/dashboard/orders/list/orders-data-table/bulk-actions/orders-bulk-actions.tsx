"use client"

import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Table } from "@tanstack/react-table"

type OrdersBulkActionsProps<TData> = {
  table: Table<TData>
}

const OrdersBulkActions = <TData,>({
  table,
}: OrdersBulkActionsProps<TData>) => {
  const bulkDeleteRooms = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    console.log("bulk delete orders", selectedRows)
  }

  return (
    <>
      {table.getFilteredSelectedRowModel().rows.length > 0 && (
        <Button type='button' size='default' onClick={bulkDeleteRooms}>
          <Icons.trash2 className='mr-2 h-4 w-4' />
          Delete
        </Button>
      )}
      <div className='flex-1'>
        {table.getFilteredSelectedRowModel().rows.length > 0 && (
          <div className='text-sm text-muted-foreground ml-2'>
            {table.getFilteredSelectedRowModel().rows.length} from{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
        )}
      </div>
    </>
  )
}

export default OrdersBulkActions

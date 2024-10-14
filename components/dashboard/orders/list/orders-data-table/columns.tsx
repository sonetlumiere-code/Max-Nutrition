import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PopulatedCustomer, PopulatedOrder } from "@/types/types"
import { ColumnDef } from "@tanstack/react-table"
import { translateOrderStatus } from "@/helpers/helpers"
import { Icons } from "@/components/icons"
import { OrderStatus } from "@prisma/client"
import { cn } from "@/lib/utils"

const getCustomerInfo = (order: PopulatedOrder) => {
  const customer = order.customer as PopulatedCustomer
  if (!customer) return ""
  const name = customer?.name ?? "No name"
  const email = customer?.user?.email ?? "No email"
  return `${name} (${email})`
}

export const columns: ColumnDef<PopulatedOrder>[] = [
  {
    id: "customerInfo",
    meta: "Cliente",
    accessorFn: (row: PopulatedOrder) => getCustomerInfo(row),
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Cliente
        <Icons.caretSortIcon className='ml-2 h-4 w-4' />
      </Button>
    ),
    cell: ({ row }) => {
      const customer = row.original.customer as PopulatedCustomer
      return (
        <div className='ml-4'>
          <div className='font-medium'>{customer?.name}</div>
          <div className='hidden text-sm text-muted-foreground md:inline'>
            {customer?.user?.email}
          </div>
        </div>
      )
    },
  },
  {
    id: "shippingMethod",
    accessorKey: "shippingMethod",
    meta: "Entrega",
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Entrega
        <Icons.caretSortIcon className='ml-2 h-4 w-4' />
      </Button>
    ),
    cell: ({ row }) => (
      <Badge className='text-xs ml-4' variant='secondary'>
        {row.getValue("shippingMethod") === "TakeAway"
          ? "Take Away"
          : "Delivery"}
      </Badge>
    ),
  },
  {
    id: "status",
    accessorFn: (row: PopulatedOrder) => translateOrderStatus(row.status),
    meta: "Estado",
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Estado
          <Icons.caretSortIcon className='ml-2 h-4 w-4' />
        </Button>
      )
    },
    cell: ({ row }) => {
      const status = row.original.status as OrderStatus
      return (
        <Badge
          className={cn("ml-4", {
            "bg-amber-500 hover:bg-amber-500/80": status === "Pending",
            "bg-sky-500 hover:bg-sky-500/80": status === "Accepted",
            "bg-emerald-500 hover:bg-emerald-500/80": status === "Completed",
            "bg-destructive hover:bg-destructive/80": status === "Cancelled",
          })}
        >
          {translateOrderStatus(status)}
        </Badge>
      )
    },
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    meta: "Fecha",
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Fecha
          <Icons.caretSortIcon className='ml-2 h-4 w-4' />
        </Button>
      )
    },
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as Date
      return <div className='ml-4'>{createdAt.toLocaleDateString()}</div>
    },
  },
  {
    id: "total",
    accessorKey: "total",
    meta: "Total",
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Total
        <Icons.caretSortIcon className='ml-2 h-4 w-4' />
      </Button>
    ),
    cell: ({ row }) => <div className='ml-4'>${row.getValue("total")}</div>,
  },
  // {
  //   accessorKey: "actions",
  //   meta: "Acciones",
  //   header: () => <p className='text-right'>Acciones</p>,
  //   cell: ({ row }) => <div className='text-right'>...</div>,
  // },
]

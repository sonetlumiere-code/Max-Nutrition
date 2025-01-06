import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { ShippingZone } from "@prisma/client"
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
import DeleteShippingZone from "@/components/dashboard/shippings/shipping-zones/delete-shipping-zone/delete-shipping-zone"

export const columns: ColumnDef<ShippingZone>[] = [
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
              <Link href={`shippings/edit-shipping-zone/${shippingZone.id}`}>
                <DropdownMenuItem>
                  <Icons.pencil className='w-4 h-4 mr-2' />
                  Editar
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <DeleteShippingZone shippingZone={shippingZone} />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]

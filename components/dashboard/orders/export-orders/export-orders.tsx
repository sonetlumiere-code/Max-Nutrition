"use client"

import { exportOrdersToExcel } from "@/actions/orders/export-orders"
import { Icons } from "@/components/icons"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useMediaQuery } from "@/hooks/use-media-query"
import { PopulatedOrder, TimePeriod } from "@/types/types"
import { OrderStatus } from "@prisma/client"
import { useState } from "react"
import { translateOrderStatus } from "@/helpers/helpers"

type ExportOrdersProps = {
  children: React.ReactNode
  orders: Record<string, PopulatedOrder[]>
  selectedTab: TimePeriod
}

const statuses: OrderStatus[] = Object.values(OrderStatus)

const ExportOrders = ({ children, orders, selectedTab }: ExportOrdersProps) => {
  const [open, setOpen] = useState(false)
  const [selectedStatuses, setSelectedStatuses] = useState<OrderStatus[]>([
    OrderStatus.PENDING,
  ])

  const isDesktop = useMediaQuery("(min-width: 768px)")

  const toggleStatus = (status: OrderStatus) => {
    const current = selectedStatuses.includes(status)
    const updated = current
      ? selectedStatuses.filter((s) => s !== status)
      : [...selectedStatuses, status]

    setSelectedStatuses(updated)
  }

  const filteredOrders = Object.values(orders)
    .flat()
    .filter((order) => selectedStatuses.includes(order.status))

  const onSubmit = () => {
    if (!filteredOrders.length) return
    exportOrdersToExcel(filteredOrders, selectedTab)
    setOpen(false)
  }

  const FormContent = () => (
    <div className='space-y-3'>
      <div className='grid grid-cols-1 gap-1'>
        {statuses.map((status) => (
          <label
            key={status}
            className='flex items-center space-x-2 cursor-pointer'
          >
            <Checkbox
              checked={selectedStatuses.includes(status)}
              onCheckedChange={() => toggleStatus(status)}
            />
            <span>{translateOrderStatus(status)}</span>
          </label>
        ))}
      </div>
      {/* {errors.statuses && (
        <p className='text-sm text-destructive'>{errors.statuses.message}</p>
      )} */}
      <div className='mt-4 flex justify-end'>
        <Button
          type='button'
          onClick={onSubmit}
          disabled={!selectedStatuses.length}
        >
          <Icons.download className='mr-2 h-4 w-4' />
          Exportar ({filteredOrders.length})
        </Button>
      </div>
    </div>
  )

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle>Exportar órdenes</DialogTitle>
            <DialogDescription>
              Selecciona los estados de pedidos que deseas exportar.
            </DialogDescription>
          </DialogHeader>
          <FormContent />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Exportar órdenes</DrawerTitle>
          <DrawerDescription>
            Selecciona los estados de pedidos que deseas exportar.
          </DrawerDescription>
        </DrawerHeader>
        <div className='px-4'>
          <FormContent />
        </div>
        <DrawerFooter className='pt-2'>
          <DrawerClose asChild>
            <Button variant='outline'>Cancelar</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default ExportOrders

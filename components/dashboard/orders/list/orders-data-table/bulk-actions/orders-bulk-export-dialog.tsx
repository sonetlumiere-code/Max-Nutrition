"use client"

import { useMediaQuery } from "@/hooks/use-media-query"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { PopulatedOrder } from "@/types/types"
import { Dispatch, SetStateAction } from "react"
import { Icons } from "@/components/icons"
import OrdersBulkExport from "./orders-bulk-export"

type OrdersBulkExportProps = {
  label: string
  orders: PopulatedOrder[]
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

const OrdersBulkExportDialog = ({
  label,
  orders,
  open,
  setOpen,
}: OrdersBulkExportProps) => {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='sm:max-w-[600px]'>
          <DialogHeader>
            <DialogTitle>Exportar pedidos</DialogTitle>
            <DialogDescription className='flex flex-col'>
              <span>{label}</span>
              <span>Cantidad de pedidos: {orders.length}</span>
            </DialogDescription>
            <div className='py-4'>
              <OrdersBulkExport orders={orders} />
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className='min-h-[40vh]'>
        <DrawerHeader>
          <DrawerTitle>Exportar pedidos</DrawerTitle>
          <DialogDescription className='flex flex-col'>
            <span>{label}</span>
            <span>Cantidad de pedidos: {orders.length}</span>
          </DialogDescription>
        </DrawerHeader>
        <div className='p-4'>
          <OrdersBulkExport orders={orders} />
        </div>
        <DrawerFooter className='border-t-2 lg:border-t-0'>
          <DrawerClose asChild>
            <Button variant='outline'>
              <Icons.moveLeftIcon className='w-4 h-4 mr-3' /> Volver
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default OrdersBulkExportDialog

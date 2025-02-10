"use client"

import { useMediaQuery } from "@/hooks/use-media-query"
import { PopulatedOrder } from "@/types/types"
import { Dispatch, SetStateAction } from "react"
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
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import OrderItemInfo from "../../order-item-details/order-item-info"

type ViewOrderProps = {
  order: PopulatedOrder
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

const ViewOrder = ({ order, open, setOpen }: ViewOrderProps) => {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const { copyToClipboard } = useCopyToClipboard()

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='sm:max-w-[600px]'>
          <DialogHeader>
            <DialogTitle>Detalle de pedido</DialogTitle>
            <DialogDescription>
              <small>Orden: {order.id}</small>
              <Button
                size='icon'
                variant='outline'
                className='h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100'
                onClick={() => copyToClipboard(order.id)}
              >
                <Icons.copy className='h-3 w-3' />
                <span className='sr-only'>Copy Order ID</span>
              </Button>
            </DialogDescription>
            <div className='py-4'>
              <OrderItemInfo order={order} />
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
          <DrawerTitle>Detalle de pedido</DrawerTitle>
          <DrawerDescription className='flex justify-center gap-2'>
            <small>Orden: {order.id}</small>
            <Button
              size='icon'
              variant='outline'
              className='h-6 w-6'
              onClick={() => copyToClipboard(order.id)}
            >
              <Icons.copy className='h-3 w-3' />
              <span className='sr-only'>Copy Order ID</span>
            </Button>
          </DrawerDescription>
        </DrawerHeader>
        <div className='p-4'>
          <OrderItemInfo order={order} />
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

export default ViewOrder

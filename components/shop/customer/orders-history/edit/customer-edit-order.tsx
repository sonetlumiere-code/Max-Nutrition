"use client"

import { Dispatch, SetStateAction } from "react"
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
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { PopulatedOrder } from "@/types/types"
import CustomerEditOrderForm from "./customer-edit-order-form"
import { Icons } from "@/components/icons"

type CustomerEditOrderProps = {
  order: PopulatedOrder
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

const CustomerEditOrder = ({
  order,
  open,
  setOpen,
}: CustomerEditOrderProps) => {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='sm:max-w-[600px]'>
          <DialogHeader>
            <DialogTitle>Editar pedido</DialogTitle>
            <DialogDescription>Editar pedido</DialogDescription>
            <div className='py-4'>
              <CustomerEditOrderForm order={order} setOpen={setOpen} />
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
          <DrawerTitle>Editar pedido</DrawerTitle>
          <DrawerDescription>Editar pedido</DrawerDescription>
        </DrawerHeader>
        <div className='p-4'>
          <CustomerEditOrderForm order={order} setOpen={setOpen} />
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

export default CustomerEditOrder

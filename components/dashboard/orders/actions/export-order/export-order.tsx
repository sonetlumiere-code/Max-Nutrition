"use client"

import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
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
import { useMediaQuery } from "@/hooks/use-media-query"
import { PopulatedOrder } from "@/types/types"
import { Dispatch, SetStateAction } from "react"

type ExportOrderProps = {
  order: PopulatedOrder
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

const ExportOrder = ({ order, open, setOpen }: ExportOrderProps) => {
  console.log(order)

  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='sm:max-w-[600px]'>
          <DialogHeader>
            <DialogTitle>Exportar pedido</DialogTitle>
            <DialogDescription>Exportar pedido</DialogDescription>
            <div className='py-4'>Export order</div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className='min-h-[40vh]'>
        <DrawerHeader>
          <DrawerTitle>Exportar pedido</DrawerTitle>
          <DrawerDescription>Exportar pedido</DrawerDescription>
        </DrawerHeader>
        <div className='p-4'>Export order</div>
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

export default ExportOrder

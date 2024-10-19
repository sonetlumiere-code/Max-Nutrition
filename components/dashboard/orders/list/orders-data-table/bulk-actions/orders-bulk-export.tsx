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
import { Dispatch, SetStateAction } from "react"
import { Icons } from "@/components/icons"

type OrdersBulkExportProps = {
  orders: PopulatedOrder[]
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

const OrdersBulkExport = ({ orders, open, setOpen }: OrdersBulkExportProps) => {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  console.log(orders)

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='sm:max-w-[600px]'>
          <DialogHeader>
            <DialogTitle>Exportar pedidos</DialogTitle>
            <DialogDescription>Exportar pedidos</DialogDescription>
            <div className='py-4'>bulk export</div>
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
          <DrawerDescription>Exportar pedidos</DrawerDescription>
        </DrawerHeader>
        <div className='p-4'>bulk export</div>
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

export default OrdersBulkExport

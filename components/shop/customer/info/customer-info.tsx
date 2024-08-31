import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Dispatch, SetStateAction } from "react"
import { Button } from "@/components/ui/button"
import { MoveLeftIcon } from "lucide-react"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import CustomerInfoContent from "./customer-info-content"
import { PopulatedCustomer } from "@/types/types"

type CustomerOrdersHistory = {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  customer: PopulatedCustomer | null
}

const CustomerInfo = ({ open, setOpen, customer }: CustomerOrdersHistory) => {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop) {
    return (
      <div className='relative flex items-center'>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className='sm:max-w-[600px]'>
            <DialogHeader>
              <DialogTitle>Mis datos</DialogTitle>
              <DialogDescription>Mis datos</DialogDescription>

              <CustomerInfoContent customer={customer} />

              <DialogFooter className='flex flex-col'>
                <DialogClose asChild>
                  <Button variant='outline'>
                    <MoveLeftIcon className='w-4 h-4 mr-3' /> Volver a la tienda
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className='relative flex items-center'>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className='min-h-[40vh]'>
          <DrawerHeader>
            <DrawerTitle>Mis datos</DrawerTitle>
            <DrawerDescription>Mis datos</DrawerDescription>
          </DrawerHeader>

          <CustomerInfoContent customer={customer} />

          <DrawerFooter className='border-t-2 lg:border-t-0'>
            <DrawerClose asChild>
              <Button variant='outline'>
                <MoveLeftIcon className='w-4 h-4 mr-3' /> Volver a la tienda
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

export default CustomerInfo

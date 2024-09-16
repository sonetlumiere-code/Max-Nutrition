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
import { PopulatedCustomer } from "@/types/types"

type CustomerCreateAddressProps = {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  customer: PopulatedCustomer | null
}

const CustomerCreateAddress = ({
  open,
  setOpen,
  customer,
}: CustomerCreateAddressProps) => {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='sm:max-w-[600px]'>
          <DialogHeader>
            <DialogTitle>Crear dirección</DialogTitle>
            <DialogDescription>Crear dirección</DialogDescription>
            Crear dirección
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
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className='min-h-[40vh]'>
        <DrawerHeader>
          <DrawerTitle>Crear dirección</DrawerTitle>
          <DrawerDescription>Crear dirección</DrawerDescription>
        </DrawerHeader>
        Crear dirección
        <DrawerFooter className='border-t-2 lg:border-t-0'>
          <DrawerClose asChild>
            <Button variant='outline'>
              <MoveLeftIcon className='w-4 h-4 mr-3' /> Volver a la tienda
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default CustomerCreateAddress

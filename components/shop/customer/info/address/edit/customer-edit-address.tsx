"use client"

import { CustomerAddress } from "@prisma/client"
import CustomerEditAddressForm from "./customer-edit-address-form"
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
import { Icons } from "@/components/icons"

type CustomerEditAddressProps = {
  address: CustomerAddress
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

const CustomerEditAddress = ({
  address,
  open,
  setOpen,
}: CustomerEditAddressProps) => {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='sm:max-w-[600px]'>
          <DialogHeader>
            <DialogTitle>Editar dirección</DialogTitle>
            <DialogDescription>Editar dirección</DialogDescription>
            <div className='py-4'>
              <CustomerEditAddressForm address={address} setOpen={setOpen} />
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
          <DrawerTitle>Editar dirección</DrawerTitle>
          <DrawerDescription>Editar dirección</DrawerDescription>
        </DrawerHeader>
        <div className='p-4'>
          <CustomerEditAddressForm address={address} setOpen={setOpen} />
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

export default CustomerEditAddress

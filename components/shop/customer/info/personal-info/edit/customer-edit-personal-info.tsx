"use client"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useMediaQuery } from "@/hooks/use-media-query"
import { ReactNode, useState } from "react"
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
  DrawerTrigger,
} from "@/components/ui/drawer"
import { PopulatedCustomer } from "@/types/types"
import CustomerEditPersonalInfoForm from "./customer-edit-personal-info-form"

type CustomerCreateAddressProps = {
  customer: PopulatedCustomer
  children: ReactNode
}

const CustomerEditPersonalInfo = ({
  customer,
  children,
}: CustomerCreateAddressProps) => {
  const [open, setOpen] = useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className='sm:max-w-[600px]'>
          <DialogHeader>
            <DialogTitle>Editar información</DialogTitle>
            <DialogDescription>Editar información personal</DialogDescription>
            <div className='py-4'>
              <CustomerEditPersonalInfoForm
                customer={customer}
                setOpen={setOpen}
              />
            </div>
            {/* <DialogFooter className='flex flex-col'>
              <DialogClose asChild>
                <Button variant='outline'>
                  <MoveLeftIcon className='w-4 h-4 mr-3' /> Volver
                </Button>
              </DialogClose>
            </DialogFooter> */}
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className='min-h-[40vh]'>
        <DrawerHeader>
          <DrawerTitle>Editar información</DrawerTitle>
          <DrawerDescription>Editar información personal</DrawerDescription>
        </DrawerHeader>
        <div className='p-4'>
          <CustomerEditPersonalInfoForm customer={customer} setOpen={setOpen} />
        </div>
        <DrawerFooter className='border-t-2 lg:border-t-0'>
          <DrawerClose asChild>
            <Button variant='outline'>
              <MoveLeftIcon className='w-4 h-4 mr-3' /> Volver
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default CustomerEditPersonalInfo

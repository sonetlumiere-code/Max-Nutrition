"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useMediaQuery } from "@/hooks/use-media-query"
import { ReactNode, useState } from "react"
import { Button } from "@/components/ui/button"
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
import { Icons } from "@/components/icons"
import CheckoutCustomerRequiredInfoForm from "./customer-required-info-form"

type CheckoutCustomerRequiredInfoProps = {
  customer: PopulatedCustomer
  open: boolean
  setOpen: (open: boolean) => void
  placeOrder: () => void
}

const CheckoutCustomerRequiredInfo = ({
  customer,
  open,
  setOpen,
  placeOrder,
}: CheckoutCustomerRequiredInfoProps) => {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='sm:max-w-[600px]'>
          <DialogHeader>
            <DialogTitle>Editar información</DialogTitle>
            <DialogDescription>Editar información personal</DialogDescription>
            <div className='py-4'>
              <CheckoutCustomerRequiredInfoForm
                customer={customer}
                placeOrder={placeOrder}
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
      <DrawerContent className='min-h-[40vh]'>
        <DrawerHeader>
          <DrawerTitle>Editar información</DrawerTitle>
          <DrawerDescription>Editar información personal</DrawerDescription>
        </DrawerHeader>
        <div className='p-4'>
          <CheckoutCustomerRequiredInfoForm
            customer={customer}
            placeOrder={placeOrder}
            setOpen={setOpen}
          />
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

export default CheckoutCustomerRequiredInfo

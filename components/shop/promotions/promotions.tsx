"use client"

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
import { ReactNode } from "react"
import { PopulatedPromotion } from "@/types/types"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"

type PromotionsProps = {
  children: ReactNode
  promotions: PopulatedPromotion[] | null
}

const Promotions = ({ children, promotions }: PromotionsProps) => {
  console.log(promotions)

  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop) {
    return (
      <div className='relative flex items-center'>
        <Dialog>
          <DialogTrigger asChild>{children}</DialogTrigger>
          <DialogContent className='sm:max-w-[600px]'>
            <DialogHeader>
              <DialogTitle>Promociones</DialogTitle>
              <DialogDescription>description</DialogDescription>
            </DialogHeader>
            content
            <DialogFooter className='flex flex-col'>
              <DialogClose asChild>
                <Button type='button' variant='outline'>
                  <Icons.moveLeftIcon className='w-4 h-4 mr-3' /> Volver
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className='relative flex items-center'>
      <Drawer>
        <DrawerTrigger asChild>{children}</DrawerTrigger>
        <DrawerContent className='min-h-[40vh]'>
          <DrawerHeader>
            <DrawerTitle>Promociones</DrawerTitle>
            <DrawerDescription>description</DrawerDescription>
          </DrawerHeader>
          content
          <DrawerFooter className='border-t-2 lg:border-t-0'>
            <DrawerClose asChild>
              <Button type='button' variant='outline'>
                <Icons.moveLeftIcon className='w-4 h-4 mr-3' /> Volver
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

export default Promotions

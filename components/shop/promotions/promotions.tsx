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
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  translatePaymentMethod,
  translateShippingMethod,
} from "@/helpers/helpers"

type PromotionsProps = {
  children: ReactNode
  promotions: PopulatedPromotion[]
}

const Promotions = ({ children, promotions }: PromotionsProps) => {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop) {
    return (
      <Dialog>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className='sm:max-w-[600px]'>
          <DialogHeader>
            <DialogTitle>Promociones</DialogTitle>
            <DialogDescription>Promociones habilitadas</DialogDescription>
          </DialogHeader>

          {promotions.map((promotion) => (
            <Alert key={promotion.id}>
              <Icons.badgePercent className='h-4 w-4' />
              <AlertTitle>{promotion.name}</AlertTitle>
              <AlertDescription className='space-y-3'>
                <span>{promotion.description}</span>

                <ul className='grid gap-3 text-sm'>
                  <li className='flex flex-col gap-1'>
                    <span className='text-muted-foreground'>
                      Métodos de pago habilitados
                    </span>
                    <div className='space-x-1'>
                      {promotion.allowedPaymentMethods.map((method) => (
                        <Badge key={method}>
                          {translatePaymentMethod(method)}
                        </Badge>
                      ))}
                    </div>
                  </li>
                  <li className='flex flex-col gap-1'>
                    <span className='text-muted-foreground'>
                      Métodos de entrega habilitados
                    </span>

                    <div className='space-x-1'>
                      {promotion.allowedShippingMethods.map((method) => (
                        <Badge key={method}>
                          {translateShippingMethod(method)}
                        </Badge>
                      ))}
                    </div>
                  </li>
                </ul>
              </AlertDescription>
            </Alert>
          ))}

          <DialogFooter className='flex flex-col'>
            <DialogClose asChild>
              <Button type='button' variant='outline'>
                <Icons.moveLeftIcon className='w-4 h-4 mr-3' /> Volver
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className='relative flex items-center'>
      <Drawer>
        <DrawerTrigger asChild>{children}</DrawerTrigger>
        <DrawerContent className='min-h-[40vh]'>
          <DrawerHeader>
            <DrawerTitle>Promociones</DrawerTitle>
            <DrawerDescription>Promociones habilitadas</DrawerDescription>
          </DrawerHeader>

          <div className='space-y-3 p-4'>
            {promotions.map((promotion) => (
              <Alert key={promotion.id}>
                <Icons.badgePercent className='h-4 w-4' />
                <AlertTitle>{promotion.name}</AlertTitle>
                <AlertDescription className='space-y-3'>
                  <span>{promotion.description}</span>

                  <ul className='grid gap-3 text-sm'>
                    <li className='flex flex-col gap-1'>
                      <span className='text-muted-foreground'>
                        Métodos de pago habilitados
                      </span>
                      <div className='space-x-1'>
                        {promotion.allowedPaymentMethods.map((method) => (
                          <Badge key={method}>
                            {translatePaymentMethod(method)}
                          </Badge>
                        ))}
                      </div>
                    </li>
                    <li className='flex flex-col gap-1'>
                      <span className='text-muted-foreground'>
                        Métodos de entrega habilitados
                      </span>

                      <div className='space-x-1'>
                        {promotion.allowedShippingMethods.map((method) => (
                          <Badge key={method}>
                            {translateShippingMethod(method)}
                          </Badge>
                        ))}
                      </div>
                    </li>
                  </ul>
                </AlertDescription>
              </Alert>
            ))}
          </div>

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

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
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { ShippingZone } from "@prisma/client"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type ShippingZonesProps = {
  children: ReactNode
  shippingZones: ShippingZone[]
}

const ShippingZones = ({ children, shippingZones }: ShippingZonesProps) => {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop) {
    return (
      <Dialog>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className='sm:max-w-[600px]'>
          <DialogHeader>
            <DialogTitle>Zonas de envío</DialogTitle>
            <DialogDescription>Zonas de envío disponibles</DialogDescription>
          </DialogHeader>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Zona</TableHead>
                <TableHead className='text-right'>Costo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shippingZones.map((shippingZone) => (
                <TableRow key={shippingZone.id}>
                  <TableCell className='text-xs md:text-sm'>
                    {shippingZone.municipality}
                  </TableCell>
                  <TableCell className='text-right'>
                    ${shippingZone.cost}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

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
            <DrawerTitle>Zonas de envío</DrawerTitle>
            <DrawerDescription>Zonas de envío disponibles</DrawerDescription>
          </DrawerHeader>

          <div className='space-y-3 p-4'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Localidad</TableHead>
                  <TableHead className='text-right'>Costo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shippingZones.map((shippingZone) => (
                  <TableRow key={shippingZone.id}>
                    <TableCell className='text-xs md:text-sm'>
                      {shippingZone.locality}
                    </TableCell>
                    <TableCell className='text-right'>
                      ${shippingZone.cost}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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

export default ShippingZones

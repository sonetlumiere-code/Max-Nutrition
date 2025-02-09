"use client"

import { useState } from "react"
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
import SearchInput from "@/components/search-input"

type ShippingZonesProps = {
  children: React.ReactNode
  shippingZones: ShippingZone[]
}

const ShippingZones = ({ children, shippingZones }: ShippingZonesProps) => {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const [search, setSearch] = useState("")

  const filteredZones = shippingZones.filter((zone) =>
    zone.locality.toLowerCase().includes(search.toLowerCase())
  )

  const renderTable = () => (
    <>
      <div className='p-2'>
        <SearchInput
          placeholder='Buscar localidad...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Localidad</TableHead>
            <TableHead className='text-right'>Costo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredZones.length > 0 ? (
            filteredZones.map((zone) => (
              <TableRow key={zone.id}>
                <TableCell className='text-xs md:text-sm'>
                  {zone.locality}
                </TableCell>
                <TableCell className='text-right'>${zone.cost}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={2} className='text-center py-4'>
                No se encontraron resultados
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  )

  if (isDesktop) {
    return (
      <Dialog>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className='sm:max-w-[600px]'>
          <DialogHeader>
            <DialogTitle>Zonas de envío</DialogTitle>
            <DialogDescription>Zonas de envío disponibles</DialogDescription>
          </DialogHeader>

          {renderTable()}

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

          <div className='space-y-3 p-4'>{renderTable()}</div>

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

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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import SearchInput from "@/components/search-input"
import { getOperationalHoursMessage } from "@/helpers/helpers"
import { PopulatedShippingZone } from "@/types/types"

type ShippingZonesProps = {
  children: React.ReactNode
  shippingZones: PopulatedShippingZone[]
}

const ShippingZones = ({ children, shippingZones }: ShippingZonesProps) => {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const [search, setSearch] = useState("")

  const filteredZones = shippingZones.filter((zone) =>
    zone.locality.toLowerCase().includes(search.toLowerCase())
  )

  const renderAccordion = () => (
    <div className='p-2 space-y-4'>
      <SearchInput
        placeholder='Buscar localidad...'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filteredZones.length > 0 ? (
        <Accordion type='single' collapsible className='w-full'>
          {filteredZones.map((zone) => (
            <AccordionItem key={zone.id} value={zone.id.toString()}>
              <AccordionTrigger className='text-xs md:text-sm'>
                {zone.locality}
              </AccordionTrigger>
              <AccordionContent className='text-sm space-y-1'>
                <div className='flex justify-between'>
                  <span className='xs:text-xs'>Costo de envío:</span>
                  <span className='xs:text-xs font-semibold'>${zone.cost}</span>
                </div>
                {zone.operationalHours && zone.operationalHours.length > 0 && (
                  <div>
                    {`${getOperationalHoursMessage(zone.operationalHours)}`}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className='text-center py-4 text-muted-foreground'>
          No se encontraron resultados
        </div>
      )}
    </div>
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

          {renderAccordion()}

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

          <div className='px-4'>{renderAccordion()}</div>

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

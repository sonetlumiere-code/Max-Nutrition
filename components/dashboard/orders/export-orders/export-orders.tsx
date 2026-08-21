"use client"

import { exportOrdersToExcel } from "@/actions/orders/export-orders"
import { Icons } from "@/components/icons"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useMediaQuery } from "@/hooks/use-media-query"
import { PopulatedOrder, TimePeriod } from "@/types/types"
import { OrderStatus } from "@prisma/client"
import { useState } from "react"
import { translateOrderStatus } from "@/helpers/helpers"
import { DateRangeBounds } from "@/helpers/date-range"
import { buildOrdersUrl } from "@/helpers/orders-query"
import { toast } from "@/components/ui/use-toast"

type ExportOrdersProps = {
  children: React.ReactNode
  orders: Record<string, PopulatedOrder[]>
  range: Partial<DateRangeBounds> | null
  selectedTab: TimePeriod
}

const statuses: OrderStatus[] = Object.values(OrderStatus)

const ExportOrders = ({
  children,
  orders,
  range,
  selectedTab,
}: ExportOrdersProps) => {
  const [open, setOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [selectedStatuses, setSelectedStatuses] = useState<OrderStatus[]>([
    OrderStatus.PENDING,
  ])

  const isDesktop = useMediaQuery("(min-width: 768px)")

  const toggleStatus = (status: OrderStatus) => {
    const current = selectedStatuses.includes(status)
    const updated = current
      ? selectedStatuses.filter((s) => s !== status)
      : [...selectedStatuses, status]

    setSelectedStatuses(updated)
  }

  const filteredOrders = Object.values(orders)
    .flat()
    .filter((order) => selectedStatuses.includes(order.status))

  const onSubmit = async () => {
    if (!filteredOrders.length || isExporting) return

    setIsExporting(true)

    try {
      // La planilla arma las hojas de ingredientes y recetas, que la lista no
      // necesita y por eso no descarga. Se piden acá, para los mismos pedidos
      // que ya están filtrados en pantalla.
      const res = await fetch(buildOrdersUrl(range, { withRecipes: true }))

      if (!res.ok) throw new Error("Failed to fetch orders")

      const detailedOrders: PopulatedOrder[] = await res.json()
      const selectedIds = new Set(filteredOrders.map((order) => order.id))

      await exportOrdersToExcel(
        detailedOrders.filter((order) => selectedIds.has(order.id)),
        selectedTab
      )

      setOpen(false)
    } catch (error) {
      console.error("Error exporting orders:", error)
      toast({
        variant: "destructive",
        title: "Error exportando pedidos.",
        description: "No se pudieron traer los datos. Intentá de nuevo.",
      })
    } finally {
      setIsExporting(false)
    }
  }

  // JSX guardado en una variable, no un componente definido acá adentro: al
  // crearse en cada render, React lo trataba como un tipo nuevo y desmontaba y
  // volvía a montar los checkboxes cada vez que cambiaba algo.
  const formContent = (
    <div className='grid gap-6'>
      <div className='grid grid-cols-1 gap-1'>
        {statuses.map((status) => (
          <label
            key={status}
            className='flex items-center space-x-2 cursor-pointer'
          >
            <Checkbox
              checked={selectedStatuses.includes(status)}
              onCheckedChange={() => toggleStatus(status)}
            />
            <span>{translateOrderStatus(status)}</span>
          </label>
        ))}
      </div>

      <Button
        type='button'
        onClick={onSubmit}
        disabled={!selectedStatuses.length || isExporting}
      >
        {isExporting ? (
          <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
        ) : (
          <Icons.download className='mr-2 h-4 w-4' />
        )}
        Exportar ({filteredOrders.length})
      </Button>
    </div>
  )

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle>Exportar órdenes</DialogTitle>
            <DialogDescription>
              Selecciona los estados de pedidos que deseas exportar.
            </DialogDescription>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Exportar órdenes</DrawerTitle>
          <DrawerDescription>
            Selecciona los estados de pedidos que deseas exportar.
          </DrawerDescription>
        </DrawerHeader>
        <div className='px-4'>
          {formContent}
        </div>
        <DrawerFooter className='pt-2'>
          <DrawerClose asChild>
            <Button variant='outline'>Cancelar</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default ExportOrders

"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import OrdersList from "@/components/dashboard/orders/list/orders-list"
import { getOrders } from "@/data/orders"
import OrderItemDetails from "@/components/dashboard/orders/list/order-item-details"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { File, ListFilter } from "lucide-react"
import { useState } from "react"
import useSWR from "swr"
import { PopulatedOrder } from "@/types/types"
import { Skeleton } from "@/components/ui/skeleton"
import { isWithinInterval, subMonths, subWeeks, subYears } from "date-fns"

type TimePeriod = "week" | "month" | "year" | "all"

const fetchOrders = async () => {
  const orders = await getOrders()
  return orders
}

export default function OrdersPage() {
  const { data: orders, error, isLoading } = useSWR("/api/orders", fetchOrders)
  const [filters, setFilters] = useState({
    Pending: true,
    Accepted: true,
    Completed: false,
    Cancelled: false,
  })
  const [selectedTab, setSelectedTab] = useState<TimePeriod>("week")
  const [selectedOrder, setSelectedOrder] = useState<PopulatedOrder | null>(
    null
  )

  const getStartDate = (tab: TimePeriod) => {
    const now = new Date()
    if (tab === "week") return subWeeks(now, 1)
    if (tab === "month") return subMonths(now, 1)
    if (tab === "year") return subYears(now, 1)
    return null // "all" tab has no date filtering
  }

  const filteredOrders = orders?.filter((order) => {
    const orderDate = new Date(order.createdAt)
    const startDate = getStartDate(selectedTab)

    const isInDateRange =
      !startDate ||
      isWithinInterval(orderDate, { start: startDate, end: new Date() })
    const isInStatusFilter =
      (filters.Pending && order.status === "Pending") ||
      (filters.Accepted && order.status === "Accepted") ||
      (filters.Completed && order.status === "Completed") ||
      (filters.Cancelled && order.status === "Cancelled")

    return isInDateRange && isInStatusFilter
  })

  const toggleFilter = (filter: keyof typeof filters) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filter]: !prevFilters[filter],
    }))
  }

  const handleTabChange = (tab: TimePeriod) => {
    setSelectedTab(tab)
  }

  if (isLoading) {
    return (
      <div className='h-screen space-y-4'>
        <div className='flex justify-between'>
          <Skeleton className='h-10 w-36' />
          <Skeleton className='h-10 w-36' />
        </div>
        <Skeleton className='h-1/2' />
      </div>
    )
  }

  if (error) {
    return <div>Error buscando pedidos.</div>
  }

  return (
    <main className='grid flex-1 items-start gap-4 md:gap-8 lg:grid-cols-3 xl:grid-cols-3'>
      <div className='grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2'>
        <Tabs
          defaultValue={selectedTab}
          onValueChange={(value) => handleTabChange(value as TimePeriod)}
        >
          <div className='flex items-center'>
            <TabsList>
              <TabsTrigger value='week'>Semana</TabsTrigger>
              <TabsTrigger value='month'>Mes</TabsTrigger>
              <TabsTrigger value='year'>Año</TabsTrigger>
              <TabsTrigger value='all'>Todos</TabsTrigger>
            </TabsList>
            <div className='ml-auto flex items-center gap-2'>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='outline'
                    size='sm'
                    className='h-7 gap-1 text-sm'
                  >
                    <ListFilter className='h-3.5 w-3.5' />
                    <span className='sr-only sm:not-sr-only'>Filter</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={filters.Pending}
                    onCheckedChange={() => toggleFilter("Pending")}
                  >
                    Pendiente
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filters.Accepted}
                    onCheckedChange={() => toggleFilter("Accepted")}
                  >
                    Aceptado
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filters.Completed}
                    onCheckedChange={() => toggleFilter("Completed")}
                  >
                    Completado
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filters.Cancelled}
                    onCheckedChange={() => toggleFilter("Cancelled")}
                  >
                    Cancelado
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button size='sm' variant='outline' className='h-7 gap-1 text-sm'>
                <File className='h-3.5 w-3.5' />
                <span className='sr-only sm:not-sr-only'>Export</span>
              </Button>
            </div>
          </div>
          <TabsContent value={selectedTab}>
            <Card>
              <CardHeader className='px-7'>
                <CardTitle>Pedidos</CardTitle>
                <CardDescription>
                  Pedidos recientes de tu tienda.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredOrders && filteredOrders.length > 0 ? (
                  <OrdersList
                    orders={filteredOrders}
                    setSelectedOrder={setSelectedOrder}
                  />
                ) : (
                  <div className='flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm h-64 p-6'>
                    <div className='flex flex-col items-center gap-1 text-center'>
                      <h3 className='text-2xl font-bold tracking-tight'>
                        Todavía no tenés ningún pedido
                      </h3>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <div>
        <OrderItemDetails selectedOrder={selectedOrder} />
      </div>
    </main>
  )
}

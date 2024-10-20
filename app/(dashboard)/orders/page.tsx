"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getOrders } from "@/data/orders"
import OrderItemDetails from "@/components/dashboard/orders/list/order-item-details/order-item-details"
import { Button } from "@/components/ui/button"
import { File } from "lucide-react"
import useSWR from "swr"
import { PopulatedOrder } from "@/types/types"
import { Skeleton } from "@/components/ui/skeleton"
import {
  isWithinInterval,
  subMonths,
  subWeeks,
  subYears,
  startOfWeek,
  getMonth,
  getYear,
  format,
  parseISO,
} from "date-fns"
import OrdersDataTable from "@/components/dashboard/orders/list/orders-data-table/orders-data-table"
import { Icons } from "@/components/icons"
import OrdersBulkExportDialog from "@/components/dashboard/orders/list/orders-data-table/bulk-actions/orders-bulk-export-dialog"
import { es } from "date-fns/locale"

type TimePeriod = "week" | "month" | "year" | "all"

const fetchOrders = async () => {
  const orders = await getOrders()
  return orders
}

export default function OrdersPage() {
  const { data: orders, error, isLoading } = useSWR("/api/orders", fetchOrders)
  const [selectedTab, setSelectedTab] = useState<TimePeriod>("week")
  const [selectedOrder, setSelectedOrder] = useState<PopulatedOrder | null>(
    null
  )
  const [openBulkExportDialog, setOpenBulkExportDialog] = useState(false)

  const getStartDate = (tab: TimePeriod) => {
    const now = new Date()
    switch (tab) {
      case "week":
        return subWeeks(now, 1)
      case "month":
        return subMonths(now, 1)
      case "year":
        return subYears(now, 1)
      default:
        return null
    }
  }

  const groupedAndFilteredOrders = useMemo(() => {
    if (!orders) return {}

    const startDate = getStartDate(selectedTab)
    const groupedOrders: { [key: string]: PopulatedOrder[] } = {}

    orders.forEach((order) => {
      const orderDate = new Date(order.createdAt)

      // Filter by selected tab date range
      const isInDateRange =
        !startDate ||
        isWithinInterval(orderDate, { start: startDate, end: new Date() })
      if (!isInDateRange) return

      // Group by week, month, or year
      let groupKey = ""
      if (selectedTab === "week") {
        const weekStart = startOfWeek(orderDate, { weekStartsOn: 1 })
        groupKey = weekStart.toISOString()
      } else if (selectedTab === "month") {
        const month = getMonth(orderDate) + 1
        const year = getYear(orderDate)
        groupKey = `${year}-${month.toString().padStart(2, "0")}`
      } else if (selectedTab === "year") {
        groupKey = getYear(orderDate).toString()
      } else {
        groupKey = "all"
      }

      // Add order to the appropriate group
      if (!groupedOrders[groupKey]) {
        groupedOrders[groupKey] = []
      }
      groupedOrders[groupKey].push(order)
    })

    // For week, month, and year, return the most recent group
    if (
      selectedTab === "week" ||
      selectedTab === "month" ||
      selectedTab === "year"
    ) {
      const sortedGroupKeys = Object.keys(groupedOrders).sort(
        (a, b) => new Date(b).getTime() - new Date(a).getTime()
      )
      const mostRecentGroupKey = sortedGroupKeys[0]
      if (mostRecentGroupKey && groupedOrders[mostRecentGroupKey]) {
        return { [mostRecentGroupKey]: groupedOrders[mostRecentGroupKey] }
      }
      return {}
    }

    return groupedOrders
  }, [orders, selectedTab])

  useEffect(() => {
    if (selectedOrder) {
      setSelectedOrder((prev) => {
        return orders?.find((order) => selectedOrder.id === order.id) || prev
      })
    }
  }, [orders, selectedOrder])

  const handleTabChange = (tab: TimePeriod) => {
    setSelectedTab(tab)
  }

  if (error) {
    return <div>Error buscando pedidos.</div>
  }

  return (
    <>
      <main className='grid flex-1 items-start gap-4 md:gap-8 lg:grid-cols-3 xl:grid-cols-3'>
        <div className='grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2'>
          {isLoading ? (
            <div className='h-screen space-y-4'>
              <div className='flex justify-between'>
                <Skeleton className='h-10 w-36' />
                <Skeleton className='h-10 w-36' />
              </div>
              <Skeleton className='h-1/2' />
            </div>
          ) : (
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
                  <Button
                    size='sm'
                    variant='outline'
                    className='h-7 gap-1 text-sm'
                    onClick={() => setOpenBulkExportDialog(true)}
                  >
                    <Icons.file className='h-3.5 w-3.5' />
                    <span className='sr-only sm:not-sr-only'>Exportar</span>
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
                    {groupedAndFilteredOrders &&
                    Object.keys(groupedAndFilteredOrders).length > 0 ? (
                      Object.entries(groupedAndFilteredOrders).map(
                        ([groupKey, groupOrders]) => (
                          <div key={groupKey}>
                            <OrdersDataTable
                              orders={groupOrders}
                              selectedOrder={selectedOrder}
                              setSelectedOrder={setSelectedOrder}
                            />
                          </div>
                        )
                      )
                    ) : (
                      <div className='flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm h-64 p-6'>
                        <div className='flex flex-col items-center justify-center'>
                          <File className='h-12 w-12 text-muted-foreground' />
                          <p className='mt-2 text-sm text-muted-foreground'>
                            No se encontraron pedidos recientes.
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
        <div>{selectedOrder && <OrderItemDetails order={selectedOrder} />}</div>
      </main>

      {Object.keys(groupedAndFilteredOrders).length > 0 && (
        <OrdersBulkExportDialog
          label={`${
            selectedTab === "week"
              ? `Pedidos de la semana del ${format(
                  new Date(Object.keys(groupedAndFilteredOrders)[0]),
                  "dd/MM/yyyy"
                )}`
              : selectedTab === "month"
              ? `Pedidos del mes de ${format(
                  parseISO(`${Object.keys(groupedAndFilteredOrders)[0]}-01`),
                  "LLLL",
                  { locale: es }
                ).replace(/^./, (str) => str.toUpperCase())}`
              : selectedTab === "year"
              ? `Pedidos del año ${format(
                  new Date(Object.keys(groupedAndFilteredOrders)[0]),
                  "yyyy"
                )}`
              : "Todos los pedidos"
          }`}
          orders={Object.values(groupedAndFilteredOrders).flat()}
          open={openBulkExportDialog}
          setOpen={setOpenBulkExportDialog}
        />
      )}
    </>
  )
}

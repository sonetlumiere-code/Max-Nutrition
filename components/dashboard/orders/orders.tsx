"use client"

import OrderItemDetails from "@/components/dashboard/orders/list/order-item-details/order-item-details"
import OrdersDataTable from "@/components/dashboard/orders/list/orders-data-table/orders-data-table"
import { Icons } from "@/components/icons"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getOrders } from "@/data/orders"
import { cn } from "@/lib/utils"
import { PopulatedOrder, TimePeriod } from "@/types/types"
import { OrderStatus } from "@prisma/client"
import {
  getMonth,
  getYear,
  isWithinInterval,
  startOfWeek,
  subMonths,
  subWeeks,
  subYears,
} from "date-fns"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import useSWR from "swr"
import { exportOrdersToExcel } from "@/actions/orders/export-orders"
import { useSession } from "next-auth/react"
import { getPermissionsKeys, hasPermission } from "@/helpers/helpers"

const fetchOrders = async () => {
  const orders = await getOrders({
    include: {
      items: {
        include: {
          product: {
            include: {
              recipe: {
                include: {
                  recipeIngredients: {
                    include: {
                      ingredient: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      customer: {
        include: {
          user: {
            select: {
              email: true,
              image: true,
            },
          },
        },
      },
      address: true,
      appliedPromotions: true,
      shopBranch: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })
  return orders
}

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

export default function Orders() {
  const [selectedTab, setSelectedTab] = useState<TimePeriod>("week")
  const [selectedOrder, setSelectedOrder] = useState<PopulatedOrder | null>(
    null
  )

  const { data: session } = useSession()

  const userPermissionsKeys = getPermissionsKeys(
    session?.user.role?.permissions
  )

  const {
    data: orders,
    error,
    isLoading,
  } = useSWR<PopulatedOrder[] | null>("orders", fetchOrders)

  const groupedAndFilteredOrders = useMemo(() => {
    if (!orders) return {}

    const startDate = getStartDate(selectedTab)
    const groupedOrders: { [key: string]: PopulatedOrder[] } = {}

    orders.forEach((order) => {
      const orderDate = new Date(order.createdAt)
      const isInDateRange =
        !startDate ||
        isWithinInterval(orderDate, { start: startDate, end: new Date() })

      if (!isInDateRange) return

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

      if (!groupedOrders[groupKey]) {
        groupedOrders[groupKey] = []
      }
      groupedOrders[groupKey].push(order)
    })

    if (["week", "month", "year"].includes(selectedTab)) {
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

  const handleExport = () => {
    if (!orders) return

    const ordersToExport = Object.values(groupedAndFilteredOrders)
      .flat()
      .filter((order) => order.status !== OrderStatus.CANCELLED)

    exportOrdersToExcel(ordersToExport, selectedTab)
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
                    onClick={handleExport}
                  >
                    <Icons.file className='h-3.5 w-3.5' />
                    <span className='sr-only sm:not-sr-only'>Exportar</span>
                  </Button>
                </div>
              </div>
              <TabsContent value={selectedTab}>
                <Card>
                  <CardHeader className='px-7'>
                    <div className='space-between flex items-center'>
                      <div className='max-w-screen-sm'>
                        <CardTitle className='text-xl'>Pedidos</CardTitle>
                        <CardDescription className='hidden md:block'>
                          Pedidos recientes de tu tienda.
                        </CardDescription>
                      </div>
                      {userPermissionsKeys?.includes("create:orders") && (
                        <div className='ml-auto'>
                          <Link
                            href='orders/create-order'
                            className={cn(
                              buttonVariants({ variant: "default" })
                            )}
                          >
                            <>
                              <Icons.circlePlus className='mr-2 h-4 w-4' />
                              Crear
                            </>
                          </Link>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {Object.keys(groupedAndFilteredOrders).length > 0 ? (
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
                          <Icons.file className='h-12 w-12 text-muted-foreground' />
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
        {selectedOrder && <OrderItemDetails order={selectedOrder} />}
      </main>
    </>
  )
}

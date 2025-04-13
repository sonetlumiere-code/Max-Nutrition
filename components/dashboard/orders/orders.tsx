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
import { endOfDay, isWithinInterval } from "date-fns"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import useSWR from "swr"
import { useSession } from "next-auth/react"
import { getPermissionsKeys, groupOrdersByPeriod } from "@/helpers/helpers"
import ExportOrders from "./export-orders/export-orders"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type FilterMode = "period" | "custom"

const fetchOrders = async () => {
  const orders = await getOrders({
    include: {
      items: {
        include: {
          product: {
            include: {
              productRecipes: {
                include: {
                  recipe: {
                    include: {
                      productRecipes: true,
                      recipeIngredients: {
                        include: {
                          ingredient: true,
                        },
                      },
                    },
                  },
                  type: true,
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
          orders: true,
        },
      },
      address: true,
      appliedPromotions: true,
      shop: true,
      shopBranch: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })
  return orders
}

/* COMPONENTE: CalendarDateRangePicker */
function CalendarDateRangePicker({
  value,
  onChange,
}: {
  value: DateRange | null
  onChange: (range: DateRange | null) => void
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          className='w-[260px] justify-start text-left font-normal'
        >
          <CalendarIcon className='mr-2 h-4 w-4' />
          {value?.from ? (
            value.to ? (
              <>
                {value.from.toLocaleDateString()} -{" "}
                {value.to.toLocaleDateString()}
              </>
            ) : (
              value.from.toLocaleDateString()
            )
          ) : (
            <span>Seleccionar rango</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0'>
        <Calendar
          initialFocus
          mode='range'
          selected={value || undefined}
          onSelect={(range) => onChange(range ?? null)}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  )
}

export default function Orders() {
  const [selectedOrder, setSelectedOrder] = useState<PopulatedOrder | null>(
    null
  )

  const [filterMode, setFilterMode] = useState<FilterMode>("period")
  const [selectedTab, setSelectedTab] = useState<TimePeriod>("week")
  const [dateRange, setDateRange] = useState<DateRange | null>(null)

  const { data: session } = useSession()

  const userPermissionsKeys = getPermissionsKeys(
    session?.user.role?.permissions
  )

  const {
    data: orders,
    error,
    isLoading,
  } = useSWR<PopulatedOrder[] | null>(["orders"], fetchOrders)

  const groupedAndFilteredOrders = useMemo(() => {
    if (!orders) return {}

    let filteredOrders = orders

    if (filterMode === "custom" && dateRange?.from && dateRange?.to) {
      filteredOrders = orders.filter((order) =>
        isWithinInterval(new Date(order.createdAt), {
          start: dateRange.from!,
          end: endOfDay(dateRange.to!),
        })
      )
      return groupOrdersByPeriod(filteredOrders, "all")
    }

    return groupOrdersByPeriod(orders, selectedTab)
  }, [orders, selectedTab, dateRange, filterMode])

  useEffect(() => {
    if (filterMode === "period") {
      setDateRange(null)
    }
  }, [filterMode])

  useEffect(() => {
    if (selectedOrder) {
      setSelectedOrder((prev) => {
        return orders?.find((order) => selectedOrder.id === order.id) || prev
      })
    }
  }, [orders, selectedOrder])

  const handleTabChange = (tab: TimePeriod) => {
    setSelectedTab(tab)
    setDateRange(null)
  }

  if (error) {
    return <div>Error buscando pedidos.</div>
  }

  return (
    <>
      <main className='grid flex-1 items-start gap-4 md:gap-8 lg:grid-cols-3 xl:grid-cols-3'>
        <div className='grid auto-rows-max items-start gap-4 md:gap-4 lg:col-span-2'>
          <Tabs
            defaultValue={selectedTab}
            onValueChange={(value) => handleTabChange(value as TimePeriod)}
          >
            <div className='flex items-bottom gap-1'>
              <DropdownMenu>
                <DropdownMenuTrigger asChild disabled={isLoading}>
                  <Button type='button' size='icon' variant='outline'>
                    <Icons.filter className='h-3.5 w-3.5' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuCheckboxItem
                    checked={filterMode === "period"}
                    onClick={() => setFilterMode("period")}
                  >
                    Filtrar por período
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filterMode === "custom"}
                    onClick={() => setFilterMode("custom")}
                  >
                    Filtrar por rango
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {filterMode === "period" && (
                <TabsList>
                  <TabsTrigger value='week' disabled={isLoading}>
                    Semana
                  </TabsTrigger>
                  <TabsTrigger value='month' disabled={isLoading}>
                    Mes
                  </TabsTrigger>
                  <TabsTrigger value='year' disabled={isLoading}>
                    Año
                  </TabsTrigger>
                  <TabsTrigger value='all' disabled={isLoading}>
                    Todos
                  </TabsTrigger>
                </TabsList>
              )}

              {filterMode === "custom" && (
                <CalendarDateRangePicker
                  value={dateRange}
                  onChange={setDateRange}
                />
              )}

              <div className='ml-auto flex items-center gap-2'>
                {groupedAndFilteredOrders &&
                  Object.keys(groupedAndFilteredOrders)[0] !== "undefined" && (
                    <ExportOrders
                      orders={groupedAndFilteredOrders}
                      selectedTab={selectedTab}
                    >
                      <Button
                        type='button'
                        variant='outline'
                        disabled={isLoading}
                      >
                        <Icons.file className='h-3.5 w-3.5' />
                        <span className='sr-only sm:not-sr-only sm:ml-2'>
                          Exportar
                        </span>
                      </Button>
                    </ExportOrders>
                  )}
              </div>
            </div>

            <TabsContent value={selectedTab}>
              <Card>
                <CardHeader className='px-7'>
                  <div className='space-between flex items-center'>
                    <div className='max-w-screen-sm'>
                      <CardTitle className='text-xl'>Pedidos</CardTitle>
                      <CardDescription className='hidden md:block'>
                        Pedidos recibidos.
                      </CardDescription>
                    </div>
                    {userPermissionsKeys?.includes("create:orders") && (
                      <div className='ml-auto'>
                        <Link
                          href='orders/create-order'
                          className={cn(buttonVariants({ variant: "default" }))}
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
                  {isLoading ? (
                    <div className='h-screen space-y-4'>
                      <div className='flex justify-between'>
                        <Skeleton className='h-10 w-80' />
                        <Skeleton className='h-8 w-20' />
                      </div>
                      <Skeleton className='h-1/2' />
                    </div>
                  ) : (
                    <>
                      {groupedAndFilteredOrders &&
                      Object.keys(groupedAndFilteredOrders)[0] !==
                        "undefined" ? (
                        Object.entries(groupedAndFilteredOrders).map(
                          ([groupKey, groupOrders]) => (
                            <div key={groupKey} className='mb-8'>
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
                              No se encontraron pedidos.
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {selectedOrder && <OrderItemDetails order={selectedOrder} />}
      </main>
    </>
  )
}

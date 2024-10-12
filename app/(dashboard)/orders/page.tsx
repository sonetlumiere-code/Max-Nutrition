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
import { useEffect, useState } from "react"
import { PopulatedOrder } from "@/types/types"
import { Skeleton } from "@/components/ui/skeleton"

export default function OrdersPage() {
  const [orders, setOrders] = useState<PopulatedOrder[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<PopulatedOrder | null>(
    null
  )

  useEffect(() => {
    const getData = async () => {
      try {
        const orders = await getOrders()
        setOrders(orders)
      } catch (error) {
        console.error("Error getting orders", error)
      } finally {
        setIsLoading(false)
      }
    }
    getData()
  }, [])

  return (
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
          <Tabs defaultValue='week'>
            <div className='flex items-center'>
              <TabsList>
                <TabsTrigger value='week'>Semana</TabsTrigger>
                <TabsTrigger value='month'>Mes</TabsTrigger>
                <TabsTrigger value='year'>Año</TabsTrigger>
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
                    <DropdownMenuCheckboxItem checked>
                      Fulfilled
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>
                      Declined
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>
                      Refunded
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  size='sm'
                  variant='outline'
                  className='h-7 gap-1 text-sm'
                >
                  <File className='h-3.5 w-3.5' />
                  <span className='sr-only sm:not-sr-only'>Export</span>
                </Button>
              </div>
            </div>
            <TabsContent value='week'>
              <Card>
                <CardHeader className='px-7'>
                  <CardTitle>Pedidos</CardTitle>
                  <CardDescription>
                    Pedidos recientes de tu tienda.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {orders && orders.length > 0 ? (
                    <OrdersList
                      orders={orders}
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
        )}
      </div>
      <div>
        <OrderItemDetails selectedOrder={selectedOrder} />
      </div>
    </main>
  )
}

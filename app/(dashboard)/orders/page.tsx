import {
  ChevronLeft,
  ChevronRight,
  Copy,
  CreditCard,
  File,
  ListFilter,
  MoreVertical,
  Truck,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getOrders } from "@/data/orders"
import { cn } from "@/lib/utils"

export default async function OrdersPage() {
  const orders = await getOrders()

  return (
    <main className='grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3'>
      <div className='grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2'>
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
                  <DropdownMenuCheckboxItem>Declined</DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem>Refunded</DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button size='sm' variant='outline' className='h-7 gap-1 text-sm'>
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead className='hidden sm:table-cell'>
                        Entrega
                      </TableHead>
                      <TableHead className='hidden sm:table-cell'>
                        Estado
                      </TableHead>
                      <TableHead className='hidden md:table-cell'>
                        Fecha
                      </TableHead>
                      <TableHead className='text-right'>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders?.map((order) => (
                      <TableRow key={order.id} className='bg-accent'>
                        <TableCell>
                          <div className='font-medium'>
                            {order.customer.user.name}
                          </div>
                          <div className='hidden text-sm text-muted-foreground md:inline'>
                            {order.customer.user.email}
                          </div>
                        </TableCell>
                        <TableCell className='hidden sm:table-cell'>
                          {Math.random() < 0.5 ? (
                            <Badge className='text-xs' variant='secondary'>
                              Envío a domicilio
                            </Badge>
                          ) : (
                            <Badge className='text-xs' variant='secondary'>
                              Retiro por sucursal
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className='hidden sm:table-cell'>
                          <Badge
                            className={cn("", {
                              "bg-amber-500 hover:bg-amber-500/80":
                                order.status === "Pending",
                              "bg-sky-500 hover:bg-sky-500/80":
                                order.status === "Accepted",
                              "bg-emerald-500 hover:bg-emerald-500/80":
                                order.status === "Completed",
                              "bg-destructive hover:bg-destructive/80":
                                order.status === "Cancelled",
                            })}
                          >
                            {order.status === "Pending" && "Pendiente"}
                            {order.status === "Accepted" && "Aceptado"}
                            {order.status === "Completed" && "Completado"}
                            {order.status === "Cancelled" && "Cancelado"}
                          </Badge>
                        </TableCell>
                        <TableCell className='hidden md:table-cell'>
                          {order.createdAt.toLocaleDateString()}
                        </TableCell>
                        <TableCell className='text-right'>
                          ${order.total}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <div>
        <Card className='overflow-hidden'>
          <CardHeader className='flex flex-row items-start bg-muted/50'>
            <div className='grid gap-0.5'>
              <CardTitle className='group flex items-center gap-2 text-lg'>
                Order Oe31b70H
                <Button
                  size='icon'
                  variant='outline'
                  className='h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100'
                >
                  <Copy className='h-3 w-3' />
                  <span className='sr-only'>Copy Order ID</span>
                </Button>
              </CardTitle>
              <CardDescription>Date: November 23, 2023</CardDescription>
            </div>
            <div className='ml-auto flex items-center gap-1'>
              <Button size='sm' variant='outline' className='h-8 gap-1'>
                <Truck className='h-3.5 w-3.5' />
                <span className='lg:sr-only xl:not-sr-only xl:whitespace-nowrap'>
                  Track Order
                </span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size='icon' variant='outline' className='h-8 w-8'>
                    <MoreVertical className='h-3.5 w-3.5' />
                    <span className='sr-only'>More</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                  <DropdownMenuItem>Export</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Trash</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className='p-6 text-sm'>
            <div className='grid gap-3'>
              <div className='font-semibold'>Order Details</div>
              <ul className='grid gap-3'>
                <li className='flex items-center justify-between'>
                  <span className='text-muted-foreground'>
                    Glimmer Lamps x <span>2</span>
                  </span>
                  <span>$250.00</span>
                </li>
                <li className='flex items-center justify-between'>
                  <span className='text-muted-foreground'>
                    Aqua Filters x <span>1</span>
                  </span>
                  <span>$49.00</span>
                </li>
              </ul>
              <Separator className='my-2' />
              <ul className='grid gap-3'>
                <li className='flex items-center justify-between'>
                  <span className='text-muted-foreground'>Subtotal</span>
                  <span>$299.00</span>
                </li>
                <li className='flex items-center justify-between'>
                  <span className='text-muted-foreground'>Shipping</span>
                  <span>$5.00</span>
                </li>
                <li className='flex items-center justify-between'>
                  <span className='text-muted-foreground'>Tax</span>
                  <span>$25.00</span>
                </li>
                <li className='flex items-center justify-between font-semibold'>
                  <span className='text-muted-foreground'>Total</span>
                  <span>$329.00</span>
                </li>
              </ul>
            </div>
            <Separator className='my-4' />
            <div className='grid grid-cols-2 gap-4'>
              <div className='grid gap-3'>
                <div className='font-semibold'>Shipping Information</div>
                <address className='grid gap-0.5 not-italic text-muted-foreground'>
                  <span>Liam Johnson</span>
                  <span>1234 Main St.</span>
                  <span>Anytown, CA 12345</span>
                </address>
              </div>
              <div className='grid auto-rows-max gap-3'>
                <div className='font-semibold'>Billing Information</div>
                <div className='text-muted-foreground'>
                  Same as shipping address
                </div>
              </div>
            </div>
            <Separator className='my-4' />
            <div className='grid gap-3'>
              <div className='font-semibold'>Customer Information</div>
              <dl className='grid gap-3'>
                <div className='flex items-center justify-between'>
                  <dt className='text-muted-foreground'>Customer</dt>
                  <dd>Liam Johnson</dd>
                </div>
                <div className='flex items-center justify-between'>
                  <dt className='text-muted-foreground'>Email</dt>
                  <dd>
                    <a href='mailto:'>liam@acme.com</a>
                  </dd>
                </div>
                <div className='flex items-center justify-between'>
                  <dt className='text-muted-foreground'>Phone</dt>
                  <dd>
                    <a href='tel:'>+1 234 567 890</a>
                  </dd>
                </div>
              </dl>
            </div>
            <Separator className='my-4' />
            <div className='grid gap-3'>
              <div className='font-semibold'>Payment Information</div>
              <dl className='grid gap-3'>
                <div className='flex items-center justify-between'>
                  <dt className='flex items-center gap-1 text-muted-foreground'>
                    <CreditCard className='h-4 w-4' />
                    Visa
                  </dt>
                  <dd>**** **** **** 4532</dd>
                </div>
              </dl>
            </div>
          </CardContent>
          <CardFooter className='flex flex-row items-center border-t bg-muted/50 px-6 py-3'>
            <div className='text-xs text-muted-foreground'>
              Updated <time dateTime='2023-11-23'>November 23, 2023</time>
            </div>
            <Pagination className='ml-auto mr-0 w-auto'>
              <PaginationContent>
                <PaginationItem>
                  <Button size='icon' variant='outline' className='h-6 w-6'>
                    <ChevronLeft className='h-3.5 w-3.5' />
                    <span className='sr-only'>Previous Order</span>
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <Button size='icon' variant='outline' className='h-6 w-6'>
                    <ChevronRight className='h-3.5 w-3.5' />
                    <span className='sr-only'>Next Order</span>
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}

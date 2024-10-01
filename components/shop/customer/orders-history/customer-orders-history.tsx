/* eslint-disable @next/next/no-img-element */
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { PopulatedOrder } from "@/types/types"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type CustomerOrderHistoryProps = {
  orders: PopulatedOrder[]
}

const CustomerOrdersHistory = ({ orders }: CustomerOrderHistoryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-xl'>Mis pedidos</CardTitle>
        <CardDescription className='hidden md:block'>
          Historial de pedidos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4 p-4'>
          {orders.length > 0 ? (
            <Accordion type='single' collapsible className=''>
              {orders.map((order, i) => (
                <AccordionItem key={order.id} value={`item-${order.id}`}>
                  <AccordionTrigger className='hover:no-underline'>
                    <div className='flex justify-between w-5/6'>
                      <small>{order.createdAt.toLocaleDateString()}</small>
                      <small>$ {order.total}</small>
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
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Table>
                      <TableBody>
                        {order.items?.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <img
                                src={
                                  item.product?.image
                                    ? `${process.env.NEXT_PUBLIC_CLOUDINARY_BASE_URL}/${item.product.image}`
                                    : "/img/no-image.jpg"
                                }
                                alt='Product image'
                                className='w-8 h-8 rounded-md'
                              />
                            </TableCell>
                            <TableCell>{item.product?.name}</TableCell>
                            <TableCell>
                              {item.withSalt ? (
                                <small>Con sal</small>
                              ) : (
                                <small>Sin sal</small>
                              )}
                            </TableCell>
                            <TableCell>x {item.quantity}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p className='text-center'>No has realizado ningún pedido</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default CustomerOrdersHistory

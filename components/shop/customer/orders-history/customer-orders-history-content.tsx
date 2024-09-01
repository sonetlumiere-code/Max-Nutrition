/* eslint-disable @next/next/no-img-element */
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { PopulatedOrder } from "@/types/types"

type CustomerOrderHistoryContentProps = {
  orders: PopulatedOrder[]
}

const CustomerOrdersHistoryContent = ({
  orders,
}: CustomerOrderHistoryContentProps) => {
  console.log(orders)

  return (
    <div className='space-y-4 p-4'>
      {orders.length > 0 ? (
        <Accordion type='single' collapsible className='w-full'>
          {orders.map((order, i) => (
            <AccordionItem key={order.id} value={`item-${order.id}`}>
              <AccordionTrigger>
                <div className='flex justify-between w-5/6'>
                  <small>{order.createdAt.toLocaleDateString()}</small>
                  <small>$ {order.total}</small>
                  <Badge>Pendiente</Badge>
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
  )
}

export default CustomerOrdersHistoryContent

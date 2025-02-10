"use client"

import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getPermissionsKeys } from "@/helpers/helpers"
import { PopulatedOrder } from "@/types/types"
import OrderItemActions from "../actions/order-item-actions"
import { useSession } from "next-auth/react"
import { format } from "date-fns"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import OrderItemInfo from "./order-item-info"

type OrderItemDetailsProps = {
  order: PopulatedOrder
}

const OrderItemDetails = ({ order }: OrderItemDetailsProps) => {
  const { data: session } = useSession()

  const { copyToClipboard } = useCopyToClipboard()

  const userPermissionsKeys = getPermissionsKeys(
    session?.user.role?.permissions
  )

  return (
    <Card className='overflow-hidden'>
      <CardHeader className='flex flex-row items-start bg-muted/50'>
        <div className='grid gap-0.5'>
          <CardTitle className='group flex items-center gap-2 text-lg'>
            <small>Orden: {order.id}</small>
            <Button
              size='icon'
              variant='outline'
              className='h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100'
              onClick={() => copyToClipboard(order.id)}
            >
              <Icons.copy className='h-3 w-3' />
              <span className='sr-only'>Copy Order ID</span>
            </Button>
          </CardTitle>
          <CardDescription>
            Fecha: {format(new Date(order.createdAt), "dd/MM/yyyy")}
          </CardDescription>
        </div>
        <div className='ml-auto flex items-center gap-1'>
          {/* <Button size='sm' variant='outline' className='h-8 gap-1'>
                <Truck className='h-3.5 w-3.5' />
                <span className='lg:sr-only xl:not-sr-only xl:whitespace-nowrap'>
                  Seguir orden
                </span>
              </Button> */}
          {(userPermissionsKeys.includes("update:orders") ||
            userPermissionsKeys.includes("delete:orders")) && (
            <OrderItemActions
              order={order}
              userPermissionsKeys={userPermissionsKeys}
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <OrderItemInfo order={order} />
      </CardContent>
      <CardFooter className='flex flex-row items-center border-t bg-muted/50 px-6 py-3'>
        <div className='text-xs text-muted-foreground'>
          Actualizado el{" "}
          <time>
            {order.updatedAt.toLocaleDateString("es-AR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        </div>
        {/* <Pagination className='ml-auto mr-0 w-auto'>
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
            </Pagination> */}
      </CardFooter>
    </Card>
  )
}

export default OrderItemDetails

import { PopulatedOrder } from "@/types/types"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import CustomerOrdersHistoryTable from "./list/customer-orders-history-table"

type CustomerOrderHistoryProps = {
  orders: PopulatedOrder[]
}

const CustomerOrdersHistory = ({ orders }: CustomerOrderHistoryProps) => {
  const ordersLength = orders.length || 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-xl'>Mis pedidos</CardTitle>
        <CardDescription className='hidden md:block'>
          Historial de pedidos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4 md:p-4'>
          {ordersLength > 0 ? (
            <CustomerOrdersHistoryTable orders={orders} />
          ) : (
            <p className='text-center'>No has realizado ningún pedido</p>
          )}
        </div>
      </CardContent>
      <CardFooter>
        {ordersLength > 0 && (
          <div className='text-xs text-muted-foreground'>
            Mostrando tu{ordersLength > 1 ? "s" : ""} último
            {ordersLength > 1 ? "s" : ""}{" "}
            <strong>{ordersLength > 1 ? ordersLength : ""}</strong> pedido
            {ordersLength > 1 ? "s" : ""}
          </div>
        )}
      </CardFooter>
    </Card>
  )
}

export default CustomerOrdersHistory

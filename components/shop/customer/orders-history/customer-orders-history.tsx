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
          {orders.length > 0 ? (
            <CustomerOrdersHistoryTable orders={orders} />
          ) : (
            <p className='text-center'>No has realizado ningún pedido</p>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <div className='text-xs text-muted-foreground'>
          Mostrando tus últimos <strong>{orders?.length}</strong> pedidos
        </div>
      </CardFooter>
    </Card>
  )
}

export default CustomerOrdersHistory

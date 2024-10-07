import { PopulatedOrder } from "@/types/types"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import CustomerOrdersHistoryList from "./list/customer-orders-history-list"

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
            <CustomerOrdersHistoryList orders={orders} />
          ) : (
            <p className='text-center'>No has realizado ningún pedido</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default CustomerOrdersHistory

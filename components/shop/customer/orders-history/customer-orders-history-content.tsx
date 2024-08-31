import { PopulatedOrder } from "@/types/types"

type CustomerOrderHistoryContentProps = {
  orders: PopulatedOrder[]
}

const CustomerOrderHistoryContent = ({
  orders,
}: CustomerOrderHistoryContentProps) => {
  console.log(orders)

  return <div>CustomerOrderHistoryContent</div>
}

export default CustomerOrderHistoryContent

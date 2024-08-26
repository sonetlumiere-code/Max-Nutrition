"use client"

import { PopulatedOrder } from "@/types/types"

type OrdersListProps = {
  orders: PopulatedOrder[] | null
}

const OrdersList = ({ orders }: OrdersListProps) => {
  console.log(orders)

  return <div>OrdersList</div>
}

export default OrdersList

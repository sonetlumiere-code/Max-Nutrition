"use client"

import { PopulatedCustomer } from "@/types/types"

type CustomerInfoContentProps = {
  customer: PopulatedCustomer | null
}

const CustomerInfoContent = ({ customer }: CustomerInfoContentProps) => {
  console.log(customer)

  return <div>CustomerInfoContent</div>
}

export default CustomerInfoContent

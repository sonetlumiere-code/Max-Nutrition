import { PopulatedCustomer } from "@/types/types"

type CustomerPersonalInfoProps = {
  customer: PopulatedCustomer
}

const CustomerPersonalInfo = ({ customer }: CustomerPersonalInfoProps) => {
  console.log(customer)
  return <div>CustomerPersonalInfo</div>
}

export default CustomerPersonalInfo

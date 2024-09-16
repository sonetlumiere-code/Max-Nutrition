import { PopulatedCustomer } from "@/types/types"

type CustomerAddressListProps = {
  customer: PopulatedCustomer
}

const CustomerAddressList = ({ customer }: CustomerAddressListProps) => {
  console.log(customer)
  return <div>CustomerAddressList</div>
}

export default CustomerAddressList

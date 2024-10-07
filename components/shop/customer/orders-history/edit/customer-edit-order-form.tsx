import { PopulatedOrder } from "@/types/types"
import { Dispatch, SetStateAction } from "react"

type CustomerEditOrderFormProps = {
  order: PopulatedOrder
  setOpen: Dispatch<SetStateAction<boolean>>
}

const CustomerEditOrderForm = ({
  order,
  setOpen,
}: CustomerEditOrderFormProps) => {
  return <div>CustomerEditOrderForm</div>
}

export default CustomerEditOrderForm

import { PopulatedOrder } from "@/types/types"
import { Dispatch, SetStateAction } from "react"

type EditOrderFormProps = {
  order: PopulatedOrder
  setOpen: Dispatch<SetStateAction<boolean>>
}

const EditOrderForm = ({ order, setOpen }: EditOrderFormProps) => {
  return <div>EditOrderForm</div>
}

export default EditOrderForm

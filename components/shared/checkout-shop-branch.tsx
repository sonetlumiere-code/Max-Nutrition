import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getOperationalHoursMessage } from "@/helpers/helpers"
import { PopulatedShopBranch } from "@/types/types"

type CheckoutOperationalHoursProps = {
  shopBranch: PopulatedShopBranch
}

const ShopBranchData = ({ shopBranch }: CheckoutOperationalHoursProps) => {
  return (
    <Alert className='border-none'>
      {/* <Icons.store className='h-4 w-4' /> */}
      <AlertTitle>{shopBranch.label}</AlertTitle>
      <AlertDescription className='text-muted-foreground'>
        {`Abierto de ${getOperationalHoursMessage(
          shopBranch.operationalHours
        )}`}
      </AlertDescription>
    </Alert>
  )
}

export default ShopBranchData

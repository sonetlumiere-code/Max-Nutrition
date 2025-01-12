import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Icons } from "@/components/icons"

type AllowedDeliveryProps = {
  isValidMinQuantity: boolean
  minProductsQuantityForDelivery: number
}

const AllowedDelivery = ({
  isValidMinQuantity,
  minProductsQuantityForDelivery,
}: AllowedDeliveryProps) => {
  return (
    <>
      {!isValidMinQuantity ? (
        <Alert variant='destructive'>
          <Icons.circleAlert className='h-4 w-4' />
          <AlertTitle className='leading-5'>
            Agrega más productos para habilitar envío a domicilio.
          </AlertTitle>
          <AlertDescription className='leading-4'>
            La cantidad mínima de productos para habilitar envío a domicilio es{" "}
            {minProductsQuantityForDelivery}.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant='success'>
          <Icons.circleCheck className='h-4 w-4' />
          <AlertTitle className='leading-5'>
            Envío a domicilio habilitado
          </AlertTitle>
          <AlertDescription className='leading-4'>
            Alcanzaste la cantidad mínima de {minProductsQuantityForDelivery}{" "}
            productos para habilitar envío a domicilio.
          </AlertDescription>
        </Alert>
      )}
    </>
  )
}

export default AllowedDelivery

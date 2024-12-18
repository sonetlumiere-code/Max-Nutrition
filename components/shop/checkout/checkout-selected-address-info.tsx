import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { CustomerAddress, ShippingZone } from "@prisma/client"

type CheckoutSelectedAddressInfoProps = {
  selectedAddress: CustomerAddress | undefined
  shippingZone: ShippingZone | undefined | null
  isValidatingShippingZone: boolean
}

const CheckoutSelectedAddressInfo = ({
  selectedAddress,
  shippingZone,
  isValidatingShippingZone,
}: CheckoutSelectedAddressInfoProps) => {
  return (
    <>
      {selectedAddress && (
        <div className='w-full text-sm space-y-3'>
          <address className='grid gap-0.5 not-italic text-muted-foreground'>
            <span>
              {selectedAddress?.addressStreet} {selectedAddress?.addressNumber}{" "}
              {selectedAddress?.addressFloor || ""}{" "}
              {selectedAddress?.addressApartment}
            </span>
            <span>
              {selectedAddress?.province}, {selectedAddress?.municipality},
              {selectedAddress?.locality}
            </span>{" "}
            <span>Código postal: {selectedAddress?.postCode}</span>
          </address>

          <Separator />

          {isValidatingShippingZone ? (
            <Skeleton className='w-20 h-5' />
          ) : shippingZone ? (
            <p className='text-muted-foreground'>
              Costo de envío a {shippingZone.locality}:{" "}
              <b>${shippingZone?.cost}</b>
            </p>
          ) : (
            <p className='text-destructive'>
              Actualmente no realizamos envíos a {selectedAddress?.locality}
            </p>
          )}
        </div>
      )}
    </>
  )
}

export default CheckoutSelectedAddressInfo

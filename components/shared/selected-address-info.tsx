import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { CustomerAddress, ShippingZone } from "@prisma/client"

type SelectedAddressInfoProps = {
  selectedAddress: CustomerAddress | undefined
  shippingZone: ShippingZone | undefined | null
  isValidatingShippingZone: boolean
}

const SelectedAddressInfo = ({
  selectedAddress,
  shippingZone,
  isValidatingShippingZone,
}: SelectedAddressInfoProps) => {
  return (
    <>
      {selectedAddress && (
        <div className='w-full text-sm space-y-3'>
          <address className='grid gap-0.5 not-italic text-muted-foreground'>
            <span>
              {`${selectedAddress?.addressStreet ?? ""} ${
                selectedAddress?.addressNumber ?? ""
              } ${selectedAddress?.addressFloor ?? ""} ${
                selectedAddress?.addressApartment ?? ""
              }`.trim()}
            </span>
            <span>
              {`${selectedAddress?.province ?? ""}, ${
                selectedAddress?.municipality ?? ""
              }, ${selectedAddress?.locality ?? ""}`
                .replace(/, ,/g, ",")
                .trim()}
            </span>
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
              Envíos a {selectedAddress?.locality} no disponibles actualmente.
            </p>
          )}
        </div>
      )}
    </>
  )
}

export default SelectedAddressInfo

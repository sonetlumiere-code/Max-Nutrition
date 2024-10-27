import { CartItem } from "@/components/cart-provider"
import { usePromotion } from "@/hooks/use-promotion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Icons } from "@/components/icons"

type CartCostPreviewProps = {
  items: CartItem[]
}

const CartCostPreview = ({ items }: CartCostPreviewProps) => {
  const { appliedPromotion } = usePromotion()

  const subtotalPrice = items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  )
  let finalPrice = subtotalPrice

  if (appliedPromotion.discountType === "Fixed") {
    finalPrice -= appliedPromotion.discount
  } else if (appliedPromotion.discountType === "Percentage") {
    finalPrice -= (subtotalPrice * appliedPromotion.discount) / 100
  }

  return (
    <>
      {appliedPromotion.discountType ? (
        <Alert>
          <Icons.badgePercent className='h-4 w-4' />
          <AlertTitle>¡Promoción aplicada!</AlertTitle>
          <AlertDescription className='flex justify-between'>
            <div className='flex flex-col'>
              <span>Subtotal</span>
              <span>Descuento</span>
              <span>Precio total</span>
            </div>
            <div className='flex flex-col text-end'>
              <span>$ {subtotalPrice}</span>
              {appliedPromotion.discountType === "Fixed" ? (
                <span className='text-destructive'>
                  -${appliedPromotion.discount}
                </span>
              ) : (
                <span>-{appliedPromotion.discount}%</span>
              )}
              <span>$ {finalPrice}</span>
            </div>
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <Icons.info className='h-4 w-4' />
          <AlertTitle>Sin promoción aplicada</AlertTitle>
          <AlertDescription>
            Actualmente no hay promociones disponibles para tu carrito. ¡Explora
            nuestras promociones para ahorrar en tu próxima compra!
          </AlertDescription>
        </Alert>
      )}
    </>
  )
}

export default CartCostPreview

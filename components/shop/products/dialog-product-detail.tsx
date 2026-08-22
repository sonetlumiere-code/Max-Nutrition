/* eslint-disable @next/next/no-img-element */
"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useCart } from "@/components/cart-provider"
import { getShopOrderingState } from "@/helpers/shop-ordering"
import { Product } from "@prisma/client"
import { toast } from "@/components/ui/use-toast"
import { Icons } from "@/components/icons"

interface DialogProductDetailProps {
  product: Product
  open: boolean
  setOpen: (open: boolean) => void
}

const DialogProductDetail: React.FC<DialogProductDetailProps> = ({
  product,
  open,
  setOpen,
}) => {
  const [quantity, setQuantity] = useState(1)
  const [variations, setVariations] = useState({ withSalt: true })

  const { addItem, shop } = useCart()

  // El mismo interruptor que esconde el botón del carrito tiene que apagar el
  // de agregar: si no, el cliente llena un carrito al que después no puede
  // llegar.
  const puedePedir = getShopOrderingState(shop).puedePedir

  // Al abrirse, el detalle vuelve a empezar: una unidad y con sal. Se ajusta
  // durante el render y no en un efecto, que es la forma que recomienda React
  // para reaccionar a un cambio de prop; con un efecto se pinta primero el
  // estado viejo y recién después el corregido.
  const [estabaAbierto, setEstabaAbierto] = useState(open)

  if (open !== estabaAbierto) {
    setEstabaAbierto(open)

    if (open) {
      setQuantity(1)
      setVariations({ withSalt: true })
    }
  }

  const addToCart = () => {
    addItem(product, quantity, variations)
    setOpen(false)
    toast({
      description: (
        <div className='flex items-center'>
          <Icons.circleCheck className='mr-2 h-5 w-5' />
          <span className='first-letter:capitalize'>
            Item{quantity > 1 && "s"} agregado{quantity > 1 && "s"} al carrito
          </span>
        </div>
      ),
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <img
            src={
              product.image
                ? `${process.env.NEXT_PUBLIC_CLOUDINARY_BASE_URL}/${product.image}`
                : "/img/no-image.jpg"
            }
            alt={product.name}
            className='rounded-lg w-full h-[200px] object-cover mt-5'
          />
          <DialogTitle className='text-left py-2'>{product.name}</DialogTitle>
          <DialogDescription className='text-left'>
            {product.description}
          </DialogDescription>
        </DialogHeader>

        {/* {shopCategory === "FOOD" && (
          <RadioGroup
            value={variations.withSalt ? "true" : "false"}
            onValueChange={(value) =>
              setVariations({ withSalt: value === "true" })
            }
            className='p-4'
          >
            {[
              { value: "true", label: "Con Sal" },
              { value: "false", label: "Sin Sal" },
            ].map((option) => (
              <div className='flex items-center space-x-2' key={option.value}>
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        )} */}

        <div className='flex items-center justify-between'>
          <h3 className='font-bold'>Tu pedido</h3>
          <h3 className='font-bold'>${product.price}</h3>
        </div>
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2 border-2 rounded-md'>
            <Button
              variant='link'
              size='icon'
              className='rounded-full p-1 hover:bg-muted transition-colors'
              onClick={() => setQuantity((prev) => prev - 1)}
              disabled={quantity === 1}
            >
              <Icons.minus className='w-4 h-4' />
            </Button>

            <div className='text-xl font-bold'>{quantity}</div>

            <Button
              variant='link'
              size='icon'
              className='rounded-full p-1 hover:bg-muted transition-colors'
              onClick={() => setQuantity((prev) => prev + 1)}
            >
              <Icons.plus className='w-4 h-4' />
            </Button>
          </div>
          <Button
            size='lg'
            onClick={addToCart}
            disabled={!puedePedir || !product.stock}
            className='flex-grow w-full text-md bg-rose-300 hover:bg-rose-400 text-stone-900'
          >
            {!puedePedir
              ? "No disponible"
              : product.stock
                ? "Agregar al carrito"
                : "Sin stock"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DialogProductDetail

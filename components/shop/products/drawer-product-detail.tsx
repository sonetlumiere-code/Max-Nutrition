/* eslint-disable @next/next/no-img-element */
"use client"

import React, { useState } from "react"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"
import { Product } from "@prisma/client"
import { useCart } from "@/components/cart-provider"
import { toast } from "@/components/ui/use-toast"
import ProductCard from "./product-card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface DrawerProductDetailsProps {
  product: Product
  open: boolean
  setOpen: (open: boolean) => void
}

const DrawerProductDetail: React.FC<DrawerProductDetailsProps> = ({
  product,
  open,
  setOpen,
}) => {
  const [quantity, setQuantity] = useState(1)

  const { addItem } = useCart()

  const addToCart = () => {
    addItem(product, quantity)
    setOpen(false)
    toast({
      title: "Item agregado al carrito",
    })
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger>
        <ProductCard product={product} />
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className='text-left'>
          <img
            src={
              product.image
                ? `${process.env.NEXT_PUBLIC_CLOUDINARY_BASE_URL}/${product.image}`
                : "/img/no-image.jpg"
            }
            alt={product.name}
            className='rounded-lg w-full h-[200px] object-cover'
          />
          <DrawerTitle className='text-left py-2'>{product.name}</DrawerTitle>
          <DrawerDescription className='text-left'>
            {product.description}
          </DrawerDescription>
        </DrawerHeader>

        <RadioGroup defaultValue={"con-sal"} className='p-4'>
          {[
            { value: "con-sal", label: "Con Sal" },
            { value: "sin-sal", label: "Sin Sal" },
          ].map((option) => (
            <div className='flex items-center space-x-2' key={option.value}>
              <RadioGroupItem value={option.value} id={option.value} />
              <Label htmlFor={option.value}>{option.label}</Label>
            </div>
          ))}
        </RadioGroup>

        <DrawerFooter>
          <hr />
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
                <Minus className='w-4 h-4' />
              </Button>
              <div className='text-xl font-bold'>{quantity}</div>
              <Button
                variant='link'
                size='icon'
                className='rounded-full p-1 hover:bg-muted transition-colors'
                onClick={() => setQuantity((prev) => prev + 1)}
              >
                <Plus className='w-4 h-4' />
              </Button>
            </div>
            <Button
              size='lg'
              onClick={addToCart}
              className='flex-grow w-full text-md bg-rose-300 hover:bg-rose-400 text-stone-900'
            >
              Agregar al carrito
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default DrawerProductDetail

/* eslint-disable @next/next/no-img-element */
"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { Product } from "@prisma/client"
import { toast } from "@/components/ui/use-toast"

interface DialogMenuProps {
  item: Product
  open: boolean
  setOpen: (open: boolean) => void
}

const DialogMenu: React.FC<DialogMenuProps> = ({ item, open, setOpen }) => {
  const [quantity, setQuantity] = useState(1)

  const { addItem } = useCart()

  const addToCart = () => {
    addItem(item, quantity)
    setOpen(false)
    toast({
      title: "Item agregado al carrito",
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className='grid grid-cols-[auto_1fr_auto] items-center gap-4 hover:cursor-pointer hover:shadow-sm'>
          <img
            src={item.image}
            width='80'
            height='80'
            alt={item.name}
            className='rounded-lg object-cover'
          />
          <div className='space-y-1'>
            <h3 className='text-base text-left font-semibold'>{item.name}</h3>
            <p className='text-sm text-left text-muted-foreground line-clamp-2'>
              {item.description}
            </p>
          </div>
          <p className='text-base font-semibold'>${item.price}</p>
        </div>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <img
            src={item.image}
            alt={item.name}
            className='rounded-lg w-full h-[200px] object-cover mt-5'
          />
          <DialogTitle className='text-left py-2'>{item.name}</DialogTitle>
          <DialogDescription className='text-left'>
            {item.description}
          </DialogDescription>
        </DialogHeader>
        {/* <RadioGroup defaultValue={item.options[0].value} className='pt-4'>
          {item.options.map((option) => (
            <div className='flex items-center space-x-2' key={option.value}>
              <RadioGroupItem value={option.value} id={option.value} />
              <Label htmlFor={option.value}>{option.label}</Label>
            </div>
          ))}
        </RadioGroup> */}
        <div className='flex items-center justify-between'>
          <h3 className='font-bold'>Tu pedido</h3>
          <h3 className='font-bold'>${item.price}</h3>
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
      </DialogContent>
    </Dialog>
  )
}

export default DialogMenu

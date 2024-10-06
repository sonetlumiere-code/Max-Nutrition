"use client"

import { useCart } from "@/components/cart-provider"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MoveLeftIcon } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import CartContent from "./cart-content"
import Link from "next/link"

const Cart = () => {
  const { items, open, setOpen } = useCart()

  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop) {
    return (
      <div className='relative flex items-center'>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className='sm:max-w-[600px]'>
            <DialogHeader>
              <DialogTitle>Carrito</DialogTitle>
              <DialogDescription>
                {items.length > 0
                  ? "Tus productos agregados al carrito actualmente"
                  : "No tienes productos agregados al carrito actualmente"}
              </DialogDescription>
            </DialogHeader>

            <CartContent items={items} />

            <DialogFooter className='flex flex-col'>
              <DialogClose asChild>
                {items.length >= 1 ? (
                  <Button type='button' asChild>
                    <Link href='/checkout'>Continuar con el pedido</Link>
                  </Button>
                ) : null}
              </DialogClose>

              {items.length >= 1 ? (
                <DialogClose asChild>
                  <Button type='button' variant='outline'>
                    Cancelar
                  </Button>
                </DialogClose>
              ) : (
                <DialogClose asChild>
                  <Button type='button' variant='outline'>
                    <MoveLeftIcon className='w-4 h-4 mr-3' /> Volver
                  </Button>
                </DialogClose>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className='relative flex items-center'>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className='min-h-[40vh]'>
          <DrawerHeader>
            <DrawerTitle>Carrito</DrawerTitle>
            <DrawerDescription>
              {items.length > 0
                ? "Tus productos agregados al carrito actualmente"
                : "No tienes productos agregados al carrito actualmente"}
            </DrawerDescription>
          </DrawerHeader>

          <CartContent items={items} />

          <DrawerFooter className='border-t-2 lg:border-t-0'>
            <DrawerClose asChild>
              {items.length >= 1 ? (
                <Button type='button' asChild>
                  <Link href='/checkout'>Continuar con el pedido</Link>
                </Button>
              ) : null}
            </DrawerClose>

            {items.length >= 1 ? (
              <DrawerClose asChild>
                <Button type='button' variant='outline'>
                  Cancelar
                </Button>
              </DrawerClose>
            ) : (
              <DrawerClose asChild>
                <Button type='button' variant='outline'>
                  <MoveLeftIcon className='w-4 h-4 mr-3' /> Volver
                </Button>
              </DrawerClose>
            )}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

export default Cart

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
import { useCreateOrder } from "@/hooks/use-create-order"
import { PopulatedCustomer } from "@/types/types"
import { Session } from "next-auth"
import CartContent from "./cart-content"

type CartProps = {
  session: Session | null
  customer: PopulatedCustomer | null
}

const Cart = ({ session, customer }: CartProps) => {
  const { items, open, setOpen } = useCart()
  const { isLoading, placeOrder } = useCreateOrder(session, customer)
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

            <CartContent items={items} isLoading={isLoading} />

            <DialogFooter className='flex flex-col'>
              {items.length >= 1 ? (
                <Button onClick={placeOrder} disabled={isLoading}>
                  Continuar con el pedido
                </Button>
              ) : null}

              {items.length >= 1 ? (
                <DialogClose asChild>
                  <Button variant='outline' disabled={isLoading}>
                    Cancelar
                  </Button>
                </DialogClose>
              ) : (
                <DialogClose asChild>
                  <Button variant='outline' disabled={isLoading}>
                    <MoveLeftIcon className='w-4 h-4 mr-3' /> Volver a la tienda
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

          <CartContent items={items} isLoading={isLoading} />

          <DrawerFooter className='border-t-2 lg:border-t-0'>
            {items.length >= 1 ? (
              <Button onClick={placeOrder} disabled={isLoading}>
                Continuar con el pedido
              </Button>
            ) : null}

            {items.length >= 1 ? (
              <DrawerClose asChild>
                <Button variant='outline' disabled={isLoading}>
                  Cancelar
                </Button>
              </DrawerClose>
            ) : (
              <DrawerClose asChild>
                <Button variant='outline' disabled={isLoading}>
                  <MoveLeftIcon className='w-4 h-4 mr-3' /> Volver a la tienda
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

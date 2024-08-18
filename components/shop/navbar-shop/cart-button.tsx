"use client"

import * as React from "react"
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
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { MoveLeftIcon, ShoppingCart } from "lucide-react"
import CartListItem from "./cart-list-item"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useMediaQuery } from "@/hooks/use-media-query"

const CartButton = () => {
  const [open, setOpen] = React.useState(false)

  const { items } = useCart()
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const CartContent = () => (
    <>
      <DrawerHeader>
        <DrawerTitle>Carrito</DrawerTitle>
        {items.length > 0 ? (
          <DrawerDescription>
            Tus productos agregados al carrito actualmente
          </DrawerDescription>
        ) : (
          <DrawerDescription>
            <h3>No tienes productos agregados al carrito actualmente</h3>
          </DrawerDescription>
        )}
      </DrawerHeader>
      {items.length > 0 ? (
        <ScrollArea className='lg:h-[30vh] h-[60vh]'>
          <Table className='border'>
            <TableHeader>
              <TableRow>
                <TableHead className='text-left'>Producto</TableHead>
                <TableHead className='text-right'>Cantidad</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <CartListItem key={item.product.id} cartItem={item} />
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      ) : (
        <div className='flex items-center justify-center h-44'>
          <ShoppingCart className='w-16 h-16 text-muted-foreground' />
        </div>
      )}
      <DrawerFooter className='border-t-2 lg:border-t-0'>
        {items.length > 1 ? <Button>Continuar con el pedido</Button> : null}

        {items.length > 1 ? (
          <DrawerClose asChild>
            <Button variant='outline'>Cancelar</Button>
          </DrawerClose>
        ) : (
          <DrawerClose asChild>
            <Button variant='outline'>
              <MoveLeftIcon className='w-4 h-4 mr-3' /> Volver a la tienda
            </Button>
          </DrawerClose>
        )}
      </DrawerFooter>
    </>
  )

  if (isDesktop) {
    return (
      <div className='relative flex items-center'>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant='ghost'>
              <ShoppingCart className='w-6 h-6 text-muted-foreground' />
              <div className='absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center text-xs font-medium'>
                {items.reduce((acc, curr) => acc + curr.quantity, 0)}
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-[600px]'>
            <CartContent />
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className='relative flex items-center'>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button variant='ghost'>
            <ShoppingCart className='w-6 h-6 text-muted-foreground' />
            <div className='absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center text-xs font-medium'>
              {items.reduce((acc, curr) => acc + curr.quantity, 0)}
            </div>
          </Button>
        </DrawerTrigger>
        <DrawerContent className='min-h-[40vh]'>
          <CartContent />
        </DrawerContent>
      </Drawer>
    </div>
  )
}

export default CartButton

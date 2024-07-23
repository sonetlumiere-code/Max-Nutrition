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
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { MoveLeft, MoveLeftIcon, ShoppingCart } from "lucide-react"
import CartListItem from "./cart-list-item"
import { ScrollArea } from "@/components/ui/scroll-area"

const CartButton = () => {
  const { items } = useCart()
  console.log(items)

  return (
    <div className='relative flex items-center'>
      <Drawer>
        <DrawerTrigger>
          <ShoppingCart className='w-6 h-6 text-muted-foreground' />
          <div className='absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center text-xs font-medium'>
            {items.reduce((acc, curr) => acc + curr.quantity, 0)}
          </div>
        </DrawerTrigger>
        <DrawerContent className='min-h-[40vh]'>
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
            <ScrollArea className='h-[60vh]'>
              <Table>
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

          <DrawerFooter>
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
        </DrawerContent>
      </Drawer>
    </div>
  )
}

export default CartButton

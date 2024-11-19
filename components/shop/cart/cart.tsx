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
import { useGetCategories } from "@/hooks/use-get-categories"
import { toast } from "@/components/ui/use-toast"

const Cart = () => {
  const { items, setItems, open, setOpen } = useCart()

  useGetCategories({
    onSuccess: (categories) => {
      if (!categories) return

      const allProducts = categories.flatMap((category) => category.products)

      const updatedItems = items.map((item) => {
        const updatedProduct = allProducts.find(
          (product) => product?.id === item.product.id
        )
        if (
          updatedProduct &&
          new Date(updatedProduct.updatedAt) > new Date(item.product.updatedAt)
        ) {
          return { ...item, product: updatedProduct }
        }
        return item
      })

      const filteredItems = updatedItems.filter((item) =>
        allProducts.some((product) => product?.id === item.product.id)
      )

      if (JSON.stringify(filteredItems) !== JSON.stringify(items)) {
        setItems(filteredItems)
        toast({
          title: "Algunos productos del carrito fueron actualizados.",
        })
      }
    },
  })

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

              <DialogClose asChild>
                <Button type='button' variant='outline' asChild>
                  <Link href='/shop'>
                    <MoveLeftIcon className='w-4 h-4 mr-3' /> Volver a tienda
                  </Link>
                </Button>
              </DialogClose>
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

            <DrawerClose asChild>
              <Button type='button' variant='outline' asChild>
                <Link href='/shop'>
                  <MoveLeftIcon className='w-4 h-4 mr-3' /> Volver a tienda
                </Link>
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

export default Cart

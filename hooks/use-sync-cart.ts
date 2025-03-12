"use client"

import { useCart } from "@/components/cart-provider"
import { toast } from "@/components/ui/use-toast"
import { useGetCategories } from "./use-get-categories"
import { ShopCategory } from "@prisma/client"

type useSyncCartProps = {
  shopCategory: ShopCategory
}

const useSyncCart = ({ shopCategory }: useSyncCartProps) => {
  const { items, setItems } = useCart()

  useGetCategories({
    shopCategory,
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
}

export default useSyncCart

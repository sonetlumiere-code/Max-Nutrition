"use client"

import { useState } from "react"
import DialogProductDetail from "./dialog-product-detail"
import DrawerProductDetail from "./drawer-product-detail"
import { Product } from "@prisma/client"
import { useMediaQuery } from "@/hooks/use-media-query"

interface ProductItemProps {
  product: Product
}

const ProductItem: React.FC<ProductItemProps> = ({ product }) => {
  const [open, setOpen] = useState(false)

  const isDesktop = useMediaQuery("(min-width: 768px)")

  return isDesktop ? (
    <DialogProductDetail product={product} open={open} setOpen={setOpen} />
  ) : (
    <DrawerProductDetail product={product} open={open} setOpen={setOpen} />
  )
}

export default ProductItem

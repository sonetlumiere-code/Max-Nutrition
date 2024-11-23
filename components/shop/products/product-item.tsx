"use client"

import { useMediaQuery } from "@/hooks/use-media-query"
import { Product } from "@prisma/client"
import { FC, useState } from "react"
import DialogProductDetail from "./dialog-product-detail"
import DrawerProductDetail from "./drawer-product-detail"

interface ProductItemProps {
  product: Product
}

const ProductItem: FC<ProductItemProps> = ({ product }) => {
  const [open, setOpen] = useState(false)

  const isDesktop = useMediaQuery("(min-width: 768px)")

  return isDesktop ? (
    <DialogProductDetail product={product} open={open} setOpen={setOpen} />
  ) : (
    <DrawerProductDetail product={product} open={open} setOpen={setOpen} />
  )
}

export default ProductItem

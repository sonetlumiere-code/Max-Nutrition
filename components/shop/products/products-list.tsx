"use client"

import { PopulatedCategory } from "@/types/types"
import { useGetCategories } from "@/hooks/use-get-categories"
import { useState } from "react"
import { ShopCategory, Product } from "@prisma/client"
import { useMediaQuery } from "@/hooks/use-media-query"
import DialogProductDetail from "./dialog-product-detail"
import DrawerProductDetail from "./drawer-product-detail"
import ProductCard from "./product-card"

const ProductsList = ({
  initialCategories,
  shopCategory,
}: {
  initialCategories: PopulatedCategory[] | null
  shopCategory: ShopCategory
}) => {
  const [productDetail, setProductDetail] = useState<{
    open: boolean
    product: Product | null
  }>({
    open: false,
    product: null,
  })

  const { categories } = useGetCategories({
    shopCategory,
    fallbackData: initialCategories,
  })

  const isDesktop = useMediaQuery("(min-width: 768px)")

  return (
    <>
      <div className='grid gap-8'>
        {categories?.map((category) => (
          <div className='grid gap-4' key={category.id}>
            {category.products && category.products.length > 0 && (
              <>
                <h2 className='text-xl font-semibold'>{category.name}</h2>
                <div className='grid gap-6'>
                  {category.products?.map((product) => (
                    <div
                      key={product.id}
                      className='cursor-pointer'
                      onClick={() => setProductDetail({ open: true, product })}
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {productDetail.product &&
        (isDesktop ? (
          <DialogProductDetail
            product={productDetail.product}
            open={productDetail.open}
            setOpen={(open) => setProductDetail((prev) => ({ ...prev, open }))}
          />
        ) : (
          <DrawerProductDetail
            product={productDetail.product}
            open={productDetail.open}
            setOpen={(open) => setProductDetail((prev) => ({ ...prev, open }))}
          />
        ))}
    </>
  )
}

export default ProductsList

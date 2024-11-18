"use client"

import ProductItem from "./product-item"
import { PopulatedCategory } from "@/types/types"
import { useGetCategories } from "@/hooks/use-get-categories"

const ProductsList = ({
  initialCategories,
}: {
  initialCategories: PopulatedCategory[] | null
}) => {
  const { categories } = useGetCategories({ fallbackData: initialCategories })

  return (
    <div className='grid gap-8'>
      {categories?.map((category) => (
        <div className='grid gap-4' key={category.id}>
          {category.products && category.products.length > 0 && (
            <>
              <h2 className='text-xl font-semibold'>{category.name}</h2>
              <div className='grid gap-6'>
                {category.products?.map(
                  (product) =>
                    product.show && (
                      <ProductItem key={product.id} product={product} />
                    )
                )}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  )
}

export default ProductsList

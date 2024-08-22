import { PopulatedCategory } from "@/types/types"
import ProductItem from "./product-item"

type ProductsListProps = {
  categories: PopulatedCategory[]
}

const ProductsList = ({ categories }: ProductsListProps) => {
  return (
    <div className='grid gap-8'>
      {categories.map((category) => (
        <div className='grid gap-4' key={category.id}>
          <h2 className='text-xl font-semibold'>{category.name}</h2>
          <div className='grid gap-6'>
            {category.products?.map((product) => (
              <ProductItem key={product.id} product={product} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ProductsList

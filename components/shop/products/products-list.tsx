import ProductItem from "./product-item"
import { getCategories } from "@/data/categories"

const ProductsList = async () => {
  const categories = await getCategories()

  return (
    <div className='grid gap-8'>
      {categories?.map((category) => (
        <div className='grid gap-4' key={category.id}>
          <h2 className='text-xl font-semibold'>{category.name}</h2>
          <div className='grid gap-6'>
            {category.products?.map(
              (product) =>
                product.show && (
                  <ProductItem key={product.id} product={product} />
                )
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ProductsList

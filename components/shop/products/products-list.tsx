import { menuData } from "./menudata"
import ProductItem from "./product-item"

const ProductsList = () => {
  return (
    <div className='grid gap-8'>
      {menuData.map((category) => (
        <div className='grid gap-4' key={category.id}>
          <h2 className='text-xl font-semibold'>{category.category}</h2>
          <div className='grid gap-6'>
            {category.items.map((item) => (
              <ProductItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ProductsList

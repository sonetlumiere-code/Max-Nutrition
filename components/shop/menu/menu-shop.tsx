import dynamic from "next/dynamic"
import { menuData } from "./menudata"
import ProductItem from "./product-item"

const CartFixedButton = dynamic(() => import("../cart-fixed-button"), {
  ssr: false,
})

const MenuShop = () => {
  return (
    <div className='flex flex-col w-full max-w-4xl mx-auto pt-8 pb-24 px-4 md:px-6'>
      <header className='flex items-center justify-between mb-8 bg-emerald-100 p-4 rounded-md'>
        <p className='text-sm text-muted-foreground'>
          Elige entre nuestra variedad semanal de platos. Cambiamos el menú cada
          lunes, así que si te gusta algo, pídelo antes de que acabe el domingo.
        </p>
      </header>
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

      <CartFixedButton />
    </div>
  )
}

export default MenuShop

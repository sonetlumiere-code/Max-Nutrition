"use client"

import { useCart } from "../cart-provider"

const CartFixedButton = () => {
  const { items } = useCart()

  return items && items.length > 0 ? (
    <div className='fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-4xl px-4'>
      <button className='w-full bg-green-500 text-white py-4 text-center rounded-lg opacity-90 hover:opacity-100 shadow-xl'>
        Ir al carrito ({items.length})
      </button>
    </div>
  ) : null
}

export default CartFixedButton

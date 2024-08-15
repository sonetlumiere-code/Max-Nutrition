"use client"

import React, { useState, useEffect } from "react"
import { menuData } from "./menudata"
import ProductItem from "./product-item"
import { useCart } from "@/components/cart-provider"

const MenuShop = () => {
  const { items } = useCart()
  const [isDesktop, setIsDesktop] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    setIsLoading(false)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <div
          className='spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-green-500'
          role='status'
        >
          <span className='visually-hidden'></span>
        </div>
      </div>
    )
  }

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
                <ProductItem key={item.id} item={item} isDesktop={isDesktop} />
              ))}
            </div>
          </div>
        ))}
      </div>
      {items && items.length > 0 ? (
        <div className='fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-4xl px-4'>
          <button className='w-full bg-green-500 text-white py-4 text-center rounded-lg opacity-90 hover:opacity-100 shadow-xl'>
            Ir al carrito ({items.length})
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default MenuShop

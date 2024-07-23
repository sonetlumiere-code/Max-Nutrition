"use client"

import { Product } from "@prisma/client"
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react"

export type CartItem = {
  product: Product
  quantity: number
}

type CartProviderState = {
  items: CartItem[]
  addItem: (product: Product, quantity: number) => void
  removeItem: (id: string) => void
  clearCart: () => void
  incrementQuantity: (id: string) => void
  decrementQuantity: (id: string) => void
}

const initialState: CartProviderState = {
  items: [],
  addItem: () => null,
  removeItem: () => null,
  clearCart: () => null,
  incrementQuantity: () => null,
  decrementQuantity: () => null,
}

const CartProviderContext = createContext<CartProviderState>(initialState)

type CartProviderProps = {
  children: ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      const storedCart = localStorage.getItem("cart")
      return storedCart ? JSON.parse(storedCart) : initialState.items
    }
    return initialState.items
  })

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items))
  }, [items])

  const addItem = (product: Product, quantity: number) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.product.id === product.id)
      if (existingItem) {
        return prevItems.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      }
      return [...prevItems, { product, quantity }]
    })
  }

  const incrementQuantity = (id: string) => {
    setItems((prevItems) =>
      prevItems.map((i) =>
        i.product.id === id ? { ...i, quantity: i.quantity + 1 } : i
      )
    )
  }

  const decrementQuantity = (id: string) => {
    setItems((prevItems) =>
      prevItems.map((i) =>
        i.product.id === id && i.quantity > 1
          ? { ...i, quantity: i.quantity - 1 }
          : i
      )
    )
  }

  const removeItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((i) => i.product.id !== id))
  }

  const clearCart = () => {
    setItems([])
  }

  const value = {
    items,
    addItem,
    removeItem,
    clearCart,
    incrementQuantity,
    decrementQuantity,
  }

  return (
    <CartProviderContext.Provider value={value}>
      {children}
    </CartProviderContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartProviderContext)

  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }

  return context
}

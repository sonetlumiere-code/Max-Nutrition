"use client"

import { Session } from "next-auth"
import { v4 as uuidv4 } from "uuid"
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  Dispatch,
  SetStateAction,
  useMemo,
} from "react"
import {
  LineItem,
  PopulatedProduct,
  PopulatedShop,
  Variation,
} from "@/types/types"

type CartProviderState = {
  items: LineItem[]
  setItems: Dispatch<SetStateAction<LineItem[]>>
  addItem: (
    product: PopulatedProduct,
    quantity: number,
    variation: Variation
  ) => void
  removeItem: (id: string) => void
  clearCart: () => void
  getSubtotalPrice: () => number
  incrementQuantity: (id: string) => void
  decrementQuantity: (id: string) => void
  open: boolean
  setOpen: (value: boolean) => void
  shop: PopulatedShop
}

const LOCAL_STORAGE_KEYS = {
  CART: (userId: string | null, shopCategory: string) =>
    userId ? `cart_${userId}_${shopCategory}` : `cart_guest_${shopCategory}`,
}

const initialState: Omit<CartProviderState, "shop"> = {
  items: [],
  setItems: () => null,
  addItem: () => null,
  removeItem: () => null,
  clearCart: () => null,
  getSubtotalPrice: () => 0,
  incrementQuantity: () => null,
  decrementQuantity: () => null,
  open: false,
  setOpen: () => null,
}

const CartProviderContext = createContext<CartProviderState | undefined>(
  undefined
)

type CartProviderProps = {
  children: ReactNode
  session: Session | null
  shop: PopulatedShop
}

const parseJSON = (value: string | null): any => {
  try {
    return value ? JSON.parse(value) : []
  } catch {
    return []
  }
}

export function CartProvider({ children, session, shop }: CartProviderProps) {
  const { shopCategory } = shop

  const storageKey = LOCAL_STORAGE_KEYS.CART(
    session?.user.id || null,
    shopCategory
  )

  const [items, setItems] = useState<LineItem[]>(() => {
    if (typeof window === "undefined") return initialState.items
    return parseJSON(localStorage.getItem(storageKey))
  })

  const [open, setOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(items))
  }, [items, storageKey])

  const addItem = (
    product: PopulatedProduct,
    quantity: number,
    variation: Variation
  ) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find(
        (i) =>
          i.product.id === product.id &&
          JSON.stringify(i.variation) === JSON.stringify(variation)
      )

      if (existingItem) {
        return prevItems.map((i) =>
          i.id === existingItem.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      }

      return [...prevItems, { id: uuidv4(), product, quantity, variation }]
    })
  }

  const incrementQuantity = (id: string) => {
    setItems((prevItems) =>
      prevItems.map((i) =>
        i.id === id ? { ...i, quantity: i.quantity + 1 } : i
      )
    )
  }

  const decrementQuantity = (id: string) => {
    setItems((prevItems) =>
      prevItems.map((i) =>
        i.id === id && i.quantity > 1 ? { ...i, quantity: i.quantity - 1 } : i
      )
    )
  }

  const removeItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((i) => i.id !== id))
  }

  const clearCart = () => {
    setItems([])
  }

  const getSubtotalPrice = useMemo(
    () => () =>
      items.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0
      ),
    [items]
  )

  const value = {
    items,
    setItems,
    addItem,
    removeItem,
    clearCart,
    getSubtotalPrice,
    incrementQuantity,
    decrementQuantity,
    open,
    setOpen,
    shop,
  }

  return (
    <CartProviderContext.Provider value={value}>
      {children}
    </CartProviderContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartProviderContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

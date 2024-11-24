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
import { PopulatedProduct, Variation } from "@/types/types"

export type CartItem = {
  id: string
  product: PopulatedProduct
  quantity: number
  variation: Variation
}

type CartProviderState = {
  items: CartItem[]
  setItems: Dispatch<SetStateAction<CartItem[]>>
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
}

const LOCAL_STORAGE_KEYS = {
  GUEST_CART: "cart_guest",
  USER_CART: (userId: string) => `cart_${userId}`,
}

const initialState: CartProviderState = {
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

const CartProviderContext = createContext<CartProviderState>(initialState)

type CartProviderProps = {
  children: ReactNode
  session: Session | null
}

const parseJSON = (value: string | null): any => {
  try {
    return value ? JSON.parse(value) : []
  } catch {
    return []
  }
}

const mergeCarts = (
  userCart: CartItem[],
  guestCart: CartItem[]
): CartItem[] => {
  const cartMap = new Map<string, CartItem>()

  ;[...userCart, ...guestCart].forEach((item) => {
    const key = `${item.product.id}-${JSON.stringify(item.variation)}`
    if (cartMap.has(key)) {
      const existing = cartMap.get(key)!
      cartMap.set(key, {
        ...existing,
        quantity: existing.quantity + item.quantity,
      })
    } else {
      cartMap.set(key, item)
    }
  })

  return Array.from(cartMap.values())
}

export function CartProvider({ children, session }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return initialState.items

    const guestCart = parseJSON(
      localStorage.getItem(LOCAL_STORAGE_KEYS.GUEST_CART)
    )

    if (session?.user.id) {
      const userCart = parseJSON(
        localStorage.getItem(LOCAL_STORAGE_KEYS.USER_CART(session.user.id))
      )
      return mergeCarts(userCart, guestCart)
    }

    return guestCart
  })

  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (session?.user.id) {
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.USER_CART(session.user.id),
        JSON.stringify(items)
      )
      localStorage.removeItem(LOCAL_STORAGE_KEYS.GUEST_CART)
    } else {
      localStorage.setItem(LOCAL_STORAGE_KEYS.GUEST_CART, JSON.stringify(items))
    }
  }, [items, session?.user.id])

  useEffect(() => {
    if (session?.user.id) {
      const guestCart = parseJSON(
        localStorage.getItem(LOCAL_STORAGE_KEYS.GUEST_CART)
      )
      if (guestCart.length) {
        setItems((prevItems) => mergeCarts(prevItems, guestCart))
        localStorage.removeItem(LOCAL_STORAGE_KEYS.GUEST_CART)
      }
    }
  }, [session?.user.id])

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

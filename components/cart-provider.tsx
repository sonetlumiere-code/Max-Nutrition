"use client"

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
import { useSession } from "next-auth/react"

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

const CartProviderContext = createContext<CartProviderState | undefined>(
  undefined
)

type CartProviderProps = {
  children: ReactNode
  shop: PopulatedShop
}

const parseJSON = (value: string | null): any => {
  try {
    return value ? JSON.parse(value) : []
  } catch {
    return []
  }
}

export function CartProvider({ children, shop }: CartProviderProps) {
  const { data: session, status } = useSession()
  const { shopCategory } = shop

  const [items, setItems] = useState<LineItem[]>([])
  const [open, setOpen] = useState(false)

  // Load cart items from localStorage when session and window are ready
  useEffect(() => {
    if (typeof window === "undefined" || status === "loading") return

    const userId = session?.user?.id || null
    const userKey = LOCAL_STORAGE_KEYS.CART(userId, shopCategory)
    const guestKey = LOCAL_STORAGE_KEYS.CART(null, shopCategory)

    const userItems = parseJSON(localStorage.getItem(userKey)) as LineItem[]
    const guestItems = parseJSON(localStorage.getItem(guestKey)) as LineItem[]

    let mergedItems = userItems

    if (userId && guestItems.length > 0) {
      guestItems.forEach((guestItem: LineItem) => {
        const existingItem = mergedItems.find(
          (i) =>
            i.product.id === guestItem.product.id &&
            JSON.stringify(i.variation) === JSON.stringify(guestItem.variation)
        )
        if (existingItem) {
          existingItem.quantity += guestItem.quantity
        } else {
          mergedItems.push(guestItem)
        }
      })

      localStorage.setItem(userKey, JSON.stringify(mergedItems))
      localStorage.removeItem(guestKey)
    }

    setItems(mergedItems)
  }, [session, status, shopCategory])

  // Persist cart to localStorage
  useEffect(() => {
    if (typeof window === "undefined" || status === "loading") return

    const key = LOCAL_STORAGE_KEYS.CART(session?.user?.id || null, shopCategory)
    localStorage.setItem(key, JSON.stringify(items))
  }, [items, session, status, shopCategory])

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

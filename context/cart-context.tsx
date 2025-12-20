"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { cartStorage, productsStorage, type Product, type CartItem } from "@/lib/store"

interface CartContextType {
  cart: CartItem[]
  itemCount: number
  total: number
  addToCart: (product: Product) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const loadedCart = cartStorage.get()
    const updatedCart = loadedCart.map(item => {
      const currentProduct = productsStorage.get().find(p => p.id === item.id)
      if (currentProduct) {
        return { ...item, price: currentProduct.price }
      }
      return item
    })
    setCart(updatedCart)
    if (updatedCart.length !== loadedCart.length || updatedCart.some((item, i) => item.price !== loadedCart[i].price)) {
      cartStorage.set(updatedCart)
    }
  }, [])

  const addToCart = (product: Product) => {
    const newCart = cartStorage.add(product)
    setCart(newCart)
    setIsOpen(true)
  }

  const removeFromCart = (productId: string) => {
    const newCart = cartStorage.remove(productId)
    setCart(newCart)
  }

  const updateQuantity = (productId: string, quantity: number) => {
    const newCart = cartStorage.updateQuantity(productId, quantity)
    setCart(newCart)
  }

  const clearCart = () => {
    const newCart = cartStorage.clear()
    setCart(newCart)
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        total,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

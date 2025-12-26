"use client"

import { useEffect, useState } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import { CartSidebar } from "@/components/cart-sidebar"
import { useCart } from "@/context/cart-context"

export function HeaderCartClient() {
  const cart = useCart()
  const [showThemeToggle, setShowThemeToggle] = useState(true)

  useEffect(() => {
    setShowThemeToggle(window.location.pathname !== "/checkout")
  }, [])

  return (
    <>
      {showThemeToggle && <ThemeToggle />}
      <CartSidebar
        cart={cart.cart}
        itemCount={cart.itemCount}
        total={cart.total}
        onUpdateQuantity={cart.updateQuantity}
        onRemove={cart.removeFromCart}
        onClear={cart.clearCart}
        isOpen={cart.isOpen}
        onOpenChange={cart.setIsOpen}
      />
    </>
  )
}

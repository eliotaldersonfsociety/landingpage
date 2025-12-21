// components/header/header-cart-client.tsx
"use client"

import { ThemeToggle } from "@/components/theme-toggle"
import { CartSidebar } from "@/components/cart-sidebar"
import { useCart } from "@/context/cart-context"

export function HeaderCartClient() {
  const cart = useCart()

  return (
    <>
      <ThemeToggle />
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

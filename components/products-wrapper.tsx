"use client"

import { Products } from "@/components/products"
import type { Product } from "@/lib/store"
import { useAnalytics } from "@/hooks/use-analytics"
import { useCart } from "@/context/cart-context"

interface ProductsWrapperProps {
  products: Product[]
}

export function ProductsWrapper({ products }: ProductsWrapperProps) {
  const { trackEvent } = useAnalytics()
  const { addToCart } = useCart()

  const handleAddToCart = (product: Product) => {
    trackEvent("add_to_cart", { productId: product.id, productName: product.name })
    addToCart(product)
  }

  return <Products products={products} onAddToCart={handleAddToCart} />
}
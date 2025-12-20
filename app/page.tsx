"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { SocialNotifications } from "@/components/social-notifications"
import { Hero } from "@/components/hero"
import { AlternatingContent } from "@/components/alternating-content"
import { OrderProcess } from "@/components/order-process"
import { Products } from "@/components/products"
import { Testimonials } from "@/components/testimonials"
import { Footer } from "@/components/footer"
import { ResultsCarousel } from "@/components/results-carousel"
import { FAQs } from "@/components/faqs"
import { DeliveryInfo } from "@/components/delivery-info"
import { useAnalytics } from "@/hooks/use-analytics"
import { productsStorage, type Product } from "@/lib/store"
import { useCart } from "@/context/cart-context"
import { BehaviorTracker } from "@/components/behavior-tracker"
import { SmartCTA } from "@/components/smart-cta"
import { AITestimonials } from "@/components/ai-testimonials"

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const { trackEvent } = useAnalytics()
  const { addToCart } = useCart()

  useEffect(() => {
    setProducts(productsStorage.get())
  }, [])

  const handleAddToCart = (product: Product) => {
    trackEvent("add_to_cart", { productId: product.id, productName: product.name })
    addToCart(product)
  }

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 md:px-0 text-center">
      <BehaviorTracker />
      <Header />
      <SocialNotifications />
      <Hero />
      <OrderProcess />
      <div className="flex items-center justify-center gap-4 font-sans text-center pt-4">
        <span className="text-red-600 font-bold text-xs line-through">
          was 80$
        </span>

        <span className="bg-orange-500 text-white font-extrabold text-sm px-4 py-1 rounded-lg shadow-md">
          now 40$
        </span>

        <span className="hidden md:inline text-green-600 font-semibold text-2xl">
          50% discount – Don't miss the opportunity!
        </span>
      </div>
      <AlternatingContent />
      <Products products={products} onAddToCart={handleAddToCart} />
      <ResultsCarousel />
      <AITestimonials />
      <div className="md:grid md:grid-cols-2 md:gap-8">
        <DeliveryInfo />
        <FAQs />
      </div>
      <OrderProcess />
      <Footer />
      <SmartCTA />
    </div>
  )
}

"use client"

import { useEffect, useRef, useState } from "react"
import { ShoppingCart, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import type { Product } from "@/lib/store"
import { DynamicPricing } from "@/components/dynamic-pricing"

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [inView, setInView] = useState(false)

  /* ===============================
     OBSERVER: PRODUCT IN VIEW
  =============================== */
  useEffect(() => {
    if (!ref.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting)
      },
      { threshold: 0.6 }
    )

    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref}>
      <Card
        className={`
          group overflow-hidden transition-all duration-300
          ${inView ? "ring-[0.5px] ring-green-400 shadow-lg" : "hover:shadow-lg"}
        `}
      >
        <CardContent className="p-0">
          <div className="relative h-64 overflow-hidden bg-muted">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
            />
            <Badge className="absolute top-3 right-3 bg-amber-400">
              {product.category}
            </Badge>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col items-center gap-3 p-6">
          <div className="flex-1 w-full text-center">
            <h3 className="font-semibold text-lg mb-1">
              {product.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {product.description}
            </p>

            <div className="mt-4 text-green-600 font-semibold">
              <DynamicPricing
                basePrice={product.price}
                productId={product.id}
              />
            </div>
          </div>

          {/* ADD TO CART BUTTON */}
          <Button
  className={`
    w-full flex items-stretch p-0 overflow-hidden
    transition
    ${inView ? "bg-green-600 hover:bg-green-700" : "bg-amber-500"}
  `}
  data-action="add-to-cart"
  onClick={() => onAddToCart(product)}
>
  {/* LEFT SIDE */}
  <div className="flex items-center justify-center gap-2 px-5 py-3 text-white flex-1">
    <ShoppingCart className="h-4 w-4" />
    <span className="text-base font-semibold">Add to Cart</span>
  </div>

  {/* RIGHT PAYPAL SIDE */}
  <div className="flex items-center justify-center px-4 bg-white">
    <span className="font-bold tracking-tight">
      <span className="text-[#094174]">Pay</span>
      <span className="text-[#0474c8] -ml-[1px]">Pal</span>
    </span>
  </div>
</Button>


          {/* PAYMENT LOGOS — SOLO CUANDO ESTÁ EN VERDE */}
          {inView && (
            <>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <span className="text-[11px] text-muted-foreground">Pay secure with</span>

                <Image
                  src="/paypal.svg"
                  alt="PayPal"
                  width={32}
                  height={20}
                />
                <Image
                  src="/visa.svg"
                  alt="Visa"
                  width={32}
                  height={20}
                />
                <Image
                  src="/mastercard.svg"
                  alt="Mastercard"
                  width={32}
                  height={20}
                />
              </div>
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <Truck/>
                <span> Ships from <strong>Hot Springs, TX</strong> · 1 business days</span>
              </div>
              <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">✔ No hidden fees
✔ Safe & encrypted payment</div>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

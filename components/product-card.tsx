"use client"

import { ShoppingCart } from "lucide-react"
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
  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div className="relative h-64 overflow-hidden bg-muted">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
          />
          <Badge className="absolute top-3 right-3 bg-amber-400">{product.category}</Badge>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-center gap-3 p-6">
        <div className="flex-1 w-full text-center">
          <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{product.description}</p>
          <div className="mt-4 text-green-500">
          <DynamicPricing basePrice={product.price} productId={product.id} />
          </div>
        </div>
        <Button className="w-full bg-amber-500" onClick={() => onAddToCart(product)}>
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  )
}

"use client"

import { ShoppingCart, Minus, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import type { CartItem } from "@/lib/store"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PersonalizedRecommendations } from "@/components/personalized-recommendations"

interface CartSidebarProps {
  cart: CartItem[]
  itemCount: number
  total: number
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemove: (productId: string) => void
  onClear: () => void
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function CartSidebar({
  cart,
  itemCount,
  total,
  onUpdateQuantity,
  onRemove,
  onClear,
  isOpen,
  onOpenChange,
}: CartSidebarProps) {
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      const cookies = document.cookie.split(';')
      const authToken = cookies.find(cookie => cookie.trim().startsWith('authToken='))
      setIsLoggedIn(!!authToken)
    }
    checkAuth()
  }, [])

  useEffect(() => {
    if (cart.length === 0 && isOpen) {
      onOpenChange(false)
      router.push('/')
    }
  }, [cart.length, isOpen, onOpenChange, router])

  const handleCheckout = () => {
    onOpenChange(false)
    if (isLoggedIn) {
      router.push("/checkout")
    } else {
      router.push("/login?redirect=/checkout")
    }
  }

  return (
    <div suppressHydrationWarning>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="relative bg-transparent" aria-label="View cart">
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <Badge className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                {itemCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-4">
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between">
              <span>Cart</span>
              {cart.length > 0 && (
                <Button variant="ghost" size="sm" onClick={onClear}>
                  Empty Cart
                </Button>
              )}
            </SheetTitle>
            <p className="text-sm text-muted-foreground text-left">Review your items and proceed to secure payment.</p>
          </SheetHeader>

          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Your cart is empty</p>
              <p className="text-sm text-muted-foreground">Add some products to get started</p>
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4 border-b pb-4">
                  <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-muted">
                    <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-sm">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => onRemove(item.id)} className="h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        className="h-8 w-8"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-12 text-center text-sm font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="h-8 w-8"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Personalized Recommendations */}
              {cart.length > 0 && (
                <div className="border-t pt-4">
                  <PersonalizedRecommendations />
                </div>
              )}

              {/* Coupon section */}
              <div className="flex items-center gap-2 pt-4">
                <Input placeholder="Enter coupon code" className="flex-1" />
                <Button className="bg-yellow-400 hover:bg-yellow-500 text-black">Apply</Button>
              </div>

              {/* Subtotal and Total */}
              <div className="pt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Accept Terms */}
              <Card className="p-4 mt-4">
                <CardContent className="p-0">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={termsAccepted}
                      onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-left"
                    >
                      Accept Terms (Required)
                      <a href="/terms-and-conditions" className="text-blue-500 hover:underline ml-1">
                        You can read our terms and conditions by clicking here.
                      </a>
                    </label>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Button */}
              <Button className="w-full bg-orange-500 hover:bg-orange-600" size="lg" disabled={!termsAccepted} onClick={handleCheckout}>
                Pay ${total.toFixed(2)}
              </Button>

            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

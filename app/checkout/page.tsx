"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { useTheme } from "next-themes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { OrderConfirmation } from "@/components/order-confirmation"
import { createOrderAction, createOrderItemsAction } from "@/lib/actions/orders"
import { cartStorage, CartItem } from "@/lib/store"
import { Footer } from "@/components/footer"
import { useConversionScore } from "@/hooks/useConversionScore"

declare global {
  interface Window {
    paypal: any
  }
}

export default function CheckoutPage() {
  const { setTheme } = useTheme()
  const score = useConversionScore()
  const paypalContainerRef = useRef<HTMLDivElement>(null)

  const [additionalInfo, setAdditionalInfo] = useState("")
  const [error, setError] = useState("")
  const [orderConfirmed, setOrderConfirmed] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [paypalLoaded, setPaypalLoaded] = useState(false)
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [paypalButtonRendered, setPaypalButtonRendered] = useState(false)

  /* ---------- INIT ---------- */
  useEffect(() => {
    setTheme("light")
    setCartItems(cartStorage.get())
  }, [setTheme])

  const total = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
    [cartItems]
  )

  const orderItems = cartItems.flatMap(item =>
    Array(item.quantity).fill({
      name: item.name,
      price: item.price,
    })
  )

  /* ---------- LOAD PAYPAL ---------- */
  useEffect(() => {
    if (window.paypal) {
      setPaypalLoaded(true)
      setScriptLoaded(true)
      return
    }

    const script = document.createElement("script")
    script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD`
    script.async = true
    script.onload = () => {
      setPaypalLoaded(true)
      setScriptLoaded(true)
    }
    script.onerror = () => {
      setError("Failed to load PayPal")
    }
    document.head.appendChild(script)
  }, [])

  /* ---------- RENDER PAYPAL ---------- */
  useEffect(() => {
    if (!scriptLoaded || total <= 0 || !paypalContainerRef.current || paypalButtonRendered) return

    const container = paypalContainerRef.current
    if (!container) return

    try {
      window.paypal.Buttons({
        createOrder: (_: any, actions: any) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: { value: total.toFixed(2) },
              },
            ],
          })
        },

        onApprove: async (_: any, actions: any) => {
          try {
            const details = await actions.order.capture()

            /* ---- CREATE ORDER ---- */
            const orderFormData = new FormData()
            orderFormData.append("total", total.toString())
            orderFormData.append("status", "completed")
            orderFormData.append("paymentMethod", "paypal")
            orderFormData.append("paypalOrderId", details.id)
            orderFormData.append("additionalInfo", additionalInfo || "")

            const orderResult = await createOrderAction(orderFormData)
            if (!orderResult.success) throw new Error(orderResult.error)

            const orderId = orderResult.data?.order?.id
            if (!orderId) throw new Error("Order ID missing")

            /* ---- CREATE ITEMS ---- */
            const itemsFormData = new FormData()
            itemsFormData.append("orderId", orderId.toString())
            itemsFormData.append("items", JSON.stringify(orderItems))

            const itemsResult = await createOrderItemsAction(itemsFormData)
            if (!itemsResult.success) throw new Error(itemsResult.error)

            setOrderConfirmed(true)
          } catch (err: any) {
            setError(err.message || "Payment failed")
          }
        },

        onError: (err: any) => {
          setError("PayPal error. Try again.")
        },
      }).render(container)
      setPaypalButtonRendered(true)
    } catch (e) {
      setError("Failed to load payment method")
    }
  }, [scriptLoaded, total, orderItems, paypalButtonRendered])

  /* ---------- CONFIRMATION ---------- */
  if (orderConfirmed) {
    const confirmationItems = cartItems.map(item => ({
      name: `${item.name} x${item.quantity}`,
      price: (item.price * item.quantity).toFixed(2),
    }))

    return (
      <div className="min-h-screen container mx-auto px-4">
        <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
          <OrderConfirmation items={confirmationItems} />
        </div>
        <Footer />
      </div>
    )
  }

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen container mx-auto px-4">

      <div className="flex flex-col items-center min-h-[calc(100vh-4rem)] p-4 space-y-6">

        <h1 className="text-4xl font-black text-center mt-8 uppercase">
          COMPLETE YOUR <span className="text-[#FF8A00]">PURCHASE</span>
        </h1>

        {/* 🔥 MENSAJE IA */}
        {score < 0.35 && (
          <p className="text-red-600 font-semibold">
            ⚠️ High demand — limited stock available
          </p>
        )}
        {score >= 0.35 && score < 0.7 && (
          <p className="text-orange-500">
            🔥 Customers are buying right now
          </p>
        )}
        {score >= 0.7 && (
          <p className="text-green-600">
            ✅ Secure checkout — instant confirmation
          </p>
        )}

        <div className="w-full max-w-2xl space-y-6">

          {/* SUMMARY */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {cartItems.map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span>{item.name} x{item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold mt-2">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* PAYPAL */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div id="paypal-button-container" ref={paypalContainerRef} />
              {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )}
              {score <= 0.35 && (
                <p className="text-sm text-muted-foreground mt-4">
                  Review your order to unlock payment
                </p>
              )}
            </CardContent>
          </Card>

          {/* EXTRA INFO */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Label>Notes</Label>
              <Textarea
                value={additionalInfo}
                onChange={e => setAdditionalInfo(e.target.value)}
              />
            </CardContent>
          </Card>

          {error && (
            <p className="text-red-500 text-center text-sm">{error}</p>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}

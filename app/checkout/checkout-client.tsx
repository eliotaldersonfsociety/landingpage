"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { useTheme } from "next-themes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { OrderConfirmation } from "@/components/order-confirmation"
import { createOrderAction, createOrderItemsAction } from "@/lib/actions/orders"
import { cartStorage, CartItem } from "@/lib/store"
import { useConversionScore } from "@/hooks/useConversionScore"

declare global {
  interface Window {
    paypal: any
  }
}

export default function CheckoutClient() {
  const { setTheme } = useTheme()
  const score = useConversionScore()
  const paypalContainerRef = useRef<HTMLDivElement>(null)

  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [additionalInfo, setAdditionalInfo] = useState("")
  const [error, setError] = useState("")
  const [orderConfirmed, setOrderConfirmed] = useState(false)
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [paypalRendered, setPaypalRendered] = useState(false)

  /* ---------- INIT ---------- */
  useEffect(() => {
    setTheme("light")
    setCartItems(cartStorage.get())
  }, [setTheme])

  /* ---------- TOTAL ---------- */
  const total = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )
  }, [cartItems])

  const orderItems = cartItems.flatMap(item =>
    Array(item.quantity).fill({
      name: item.name,
      price: item.price,
    })
  )

  /* ---------- LOAD PAYPAL ---------- */
  useEffect(() => {
    if (window.paypal) {
      setScriptLoaded(true)
      return
    }

    const script = document.createElement("script")
    script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD`
    script.async = true
    script.onload = () => setScriptLoaded(true)
    script.onerror = () => setError("Failed to load PayPal")

    document.body.appendChild(script)
  }, [])

  /* ---------- RENDER PAYPAL ---------- */
  useEffect(() => {
    if (!scriptLoaded || total <= 0 || paypalRendered || !paypalContainerRef.current) return

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

          // ---- CREATE ORDER ----
          const orderFormData = new FormData()
          orderFormData.append("total", total.toString())
          orderFormData.append("status", "completed")
          orderFormData.append("paymentMethod", "paypal")
          orderFormData.append("paypalOrderId", details.id)
          orderFormData.append("additionalInfo", additionalInfo)

          const orderResult = await createOrderAction(orderFormData)
          if (!orderResult.success) throw new Error(orderResult.error)

          const orderId = orderResult.data?.order?.id
          if (!orderId) throw new Error("Order ID missing")

          // ---- CREATE ITEMS ----
          const itemsFormData = new FormData()
          itemsFormData.append("orderId", orderId.toString())
          itemsFormData.append("items", JSON.stringify(orderItems))

          const itemsResult = await createOrderItemsAction(itemsFormData)
          if (!itemsResult.success) throw new Error(itemsResult.error)

          cartStorage.clear()
          setOrderConfirmed(true)

        } catch (err: any) {
          setError(err.message || "Payment failed")
        }
      },

      onError: () => {
        setError("PayPal error. Try again.")
      },
    }).render(paypalContainerRef.current)

    setPaypalRendered(true)
  }, [scriptLoaded, total, paypalRendered, orderItems, additionalInfo])

  /* ---------- CONFIRMATION ---------- */
  if (orderConfirmed) {
    const confirmationItems = cartItems.map(item => ({
      name: `${item.name} x${item.quantity}`,
      price: (item.price * item.quantity).toFixed(2),
    }))

    return (
      <div className="min-h-screen container mx-auto px-4 flex items-center justify-center">
        <OrderConfirmation items={confirmationItems} />
      </div>
    )
  }

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen container mx-auto px-4 py-10">

      <h1 className="text-4xl font-black text-center uppercase mb-6">
        Complete your <span className="text-[#FF8A00]">purchase</span>
      </h1>

      {score < 0.35 && (
        <p className="text-red-600 text-center font-semibold">
          ⚠️ High demand — limited stock
        </p>
      )}
      {score >= 0.35 && score < 0.7 && (
        <p className="text-orange-500 text-center">
          🔥 Customers are buying right now
        </p>
      )}
      {score >= 0.7 && (
        <p className="text-green-600 text-center">
          ✅ Secure checkout
        </p>
      )}

      <div className="max-w-2xl mx-auto space-y-6 mt-6">

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
            <CardTitle>Payment</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div ref={paypalContainerRef} />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </CardContent>
        </Card>

        {/* NOTES */}
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

      </div>
    </div>
  )
}

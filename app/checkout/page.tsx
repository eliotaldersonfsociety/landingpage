"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { OrderConfirmation } from "@/components/order-confirmation"
import { createOrderAction, createOrderItemsAction } from "@/lib/actions/orders"
import { cartStorage, CartItem } from "@/lib/store"
import { Header } from "@/components/header/header"
import { Footer } from "@/components/footer"

declare global {
  interface Window {
    paypal: any
  }
}

export default function CheckoutPage() {
  const [additionalInfo, setAdditionalInfo] = useState("")
  const [error, setError] = useState("")
  const [orderConfirmed, setOrderConfirmed] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [paypalLoaded, setPaypalLoaded] = useState(false)

  useEffect(() => {
    setCartItems(cartStorage.get())
  }, [])

  const total = useMemo(() => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [cartItems])

  const orderItems = cartItems.flatMap(item =>
    Array(item.quantity).fill({ name: item.name, price: item.price })
  )

  useEffect(() => {
    if (window.paypal) {
      setPaypalLoaded(true)
    } else {
      const script = document.createElement('script')
      script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD`
      script.async = true
      document.head.appendChild(script)

      script.onload = () => {
        console.log("PayPal SDK loaded")
        setPaypalLoaded(true)
      }

      script.onerror = () => {
        console.error("Failed to load PayPal SDK")
      }
    }
  }, [])

  useEffect(() => {
    if (paypalLoaded && total > 0) {
      // Clear existing buttons
      const container = document.getElementById('paypal-button-container')
      if (!container) {
        console.warn('PayPal container not found, retrying...')
        setTimeout(() => {
          const retryContainer = document.getElementById('paypal-button-container')
          if (retryContainer) {
            retryContainer.innerHTML = ''
            renderButtons(retryContainer)
          }
        }, 100)
        return
      }
      container.innerHTML = ''
      renderButtons(container)
    }

    function renderButtons(container: HTMLElement) {

      interface PayPalOrderData {
        orderID: string
      }

      interface PayPalActions {
        order: {
          create: (options: PayPalCreateOrderOptions) => Promise<string>
          capture: () => Promise<PayPalOrderDetails>
        }
      }

      interface PayPalCreateOrderOptions {
        purchase_units: Array<{
          amount: {
            value: string
          }
        }>
      }

      interface PayPalOrderDetails {
        id: string
        status: string
      }

      window.paypal.Buttons({
        createOrder: (data: PayPalOrderData, actions: PayPalActions) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: total.toFixed(2)
              }
            }]
          })
        },
        onApprove: async (data: PayPalOrderData, actions: PayPalActions) => {
          try {
            const details = await actions.order.capture()
            console.log("PayPal payment captured:", details)

            // Create order in database
            const orderFormData = new FormData()
            orderFormData.append('total', total.toString())
            orderFormData.append('status', 'completed')
            orderFormData.append('paymentMethod', 'paypal')
            orderFormData.append('paypalOrderId', details.id)
            orderFormData.append('additionalInfo', additionalInfo || '')

            const orderResult = await createOrderAction(orderFormData)

            if (!orderResult.success) {
              throw new Error(orderResult.error || "Error creating the order")
            }

            const orderId = orderResult.data?.order?.id

            if (!orderId) {
              throw new Error("Could not get the created order ID")
            }

            // Create the order items
            const itemsFormData = new FormData()
            itemsFormData.append('orderId', orderId.toString())
            itemsFormData.append('items', JSON.stringify(orderItems.map(item => ({
              name: item.name,
              price: item.price
            }))))

            const itemsResult = await createOrderItemsAction(itemsFormData)

            if (!itemsResult.success) {
              throw new Error(itemsResult.error || "Error creating the order items")
            }

            setOrderConfirmed(true)
          } catch (err) {
            console.error("Error processing PayPal payment:", err)
            setError(err instanceof Error ? err.message : "There was an error processing your PayPal payment. Please try again.")
          }
        },
        onError: (err: any) => {
          console.error("PayPal error:", err)
          setError("There was an error with PayPal. Please try again.")
        }
      }).render(container)
    }
  }, [paypalLoaded, total, additionalInfo, orderItems])


  if (orderConfirmed) {
    // Convert orderItems to string for OrderConfirmation
    const orderItemsForConfirmation = cartItems.map(item => ({
      name: `${item.name} x${item.quantity}`,
      price: (item.price * item.quantity).toString()
    }))

    return (
      <div className="min-h-screen bg-background container mx-auto px-4">
        <Header />
        <div className="flex justify-center items-center min-h-[calc(100vh-4rem)] p-4">
          <OrderConfirmation items={orderItemsForConfirmation} />
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background container mx-auto px-4">
      <Header />
      <div className="flex flex-col items-center min-h-[calc(100vh-4rem)] p-4 space-y-6">
      <h1 className="text-4xl font-black text-center mt-8 uppercase">
        COMPLETE YOUR <span className="text-[#FF8A00]">PURCHASE</span>
      </h1>

      <p className="text-lg text-muted-foreground text-center mb-8">
        Choose your payment method and complete your order.
      </p>

      <div className="w-full max-w-2xl space-y-6">
        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {orderItems.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span>{item.name}</span>
                  <span>${item.price.toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>Pay securely with PayPal:</p>
              <div id="paypal-button-container"></div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="additionalInfo">Any special requests or questions...</Label>
              <Textarea
                id="additionalInfo"
                placeholder="Eg: My username is username#1234"
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>


        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </div>
      </div>
      <Footer />
    </div>
  )
}

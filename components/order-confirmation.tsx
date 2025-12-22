"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { cartStorage } from "@/lib/store"

interface OrderConfirmationProps {
  items: { name: string; price: string }[]
}

export function OrderConfirmation({ items }: OrderConfirmationProps) {
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (countdown <= 0) {
      cartStorage.clear()
      window.location.href = "/dashboard"
    }
  }, [countdown])

  return (
    <Card className="w-full max-w-2xl text-center">
      <CardHeader className="flex flex-col items-center">
        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
        <CardTitle className="text-3xl font-bold">Purchase Completed!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-lg text-muted-foreground">
          Your order has been processed successfully. In a few minutes, you will receive an email with the confirmation of your purchase and the details of your order.
        </p>
        <p className="text-sm text-blue-500">
          You will be redirected to your dashboard in {countdown} seconds...
        </p>
        <div className="space-y-2 text-left">
          <h3 className="text-xl font-semibold">Order Summary:</h3>
          <div className="border rounded-md p-4 space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex justify-between">
                <span>{item.name}</span>
                <span>{item.price}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold border-t pt-2 mt-2">
              <span>Total:</span>
              <span>
                ${
                  items
                    .reduce((sum, item) => sum + parseFloat(item.price.replace("$", "")), 0)
                    .toFixed(2)
                }
              </span>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Thank you for your purchase. If you have any questions, feel free to contact us.
        </p>
      </CardContent>
    </Card>
  )
}

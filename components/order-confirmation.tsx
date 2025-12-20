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
        <CardTitle className="text-3xl font-bold">¡Compra Completada!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-lg text-muted-foreground">
          Tu pedido ha sido procesado exitosamente. En unos minutos, recibirás un correo electrónico con la confirmación de tu compra y los detalles de tu pedido.
        </p>
        <p className="text-sm text-blue-500">
          Serás redirigido a tu dashboard en {countdown} segundos...
        </p>
        <div className="space-y-2 text-left">
          <h3 className="text-xl font-semibold">Resumen de tu Pedido:</h3>
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
          Gracias por tu compra. Si tienes alguna pregunta, no dudes en contactarnos.
        </p>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState, useEffect } from "react"
import { ShoppingCart } from "lucide-react"

const messageTemplates = [
  (num: number) => `${num} personas están viendo esto`,
  (num: number) => `${num} personas han comprado en los últimos 10 minutos`,
  (num: number) => `${num} personas agregaron un producto al carrito`,
  (num: number) => `${num} personas están comprando ahora`
]

const getRandomNumber = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

export function SocialNotifications() {
  const [currentMessage, setCurrentMessage] = useState(0)
  const [numbers, setNumbers] = useState([50, 15, 5, 2])
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const showNotification = () => {
      setCurrentMessage((prev) => (prev + 1) % messageTemplates.length)
      setNumbers([
        getRandomNumber(10, 50), // 10-50
        getRandomNumber(3, 20),  // 3-20
        getRandomNumber(1, 5),   // 1-5
        getRandomNumber(1, 2)    // 1-2
      ])
      setVisible(true)
      setTimeout(() => setVisible(false), 4000) // Show for 4 seconds
    }

    const interval = setInterval(() => {
      showNotification()
    }, getRandomNumber(5000, 10000)) // Every 5-10 seconds

    // Initial show
    showNotification()

    return () => clearInterval(interval)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed top-16 md:top-12 left-1/2 transform -translate-x-1/2 z-50">
      <div className="backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border">
        <p className="text-green-600 font-medium text-xs md:text-sm flex items-center gap-2">
          <ShoppingCart className="h-8 w-8" />
          {messageTemplates[currentMessage](numbers[currentMessage])}
        </p>
      </div>
    </div>
  )
}
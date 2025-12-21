"use client"

import { useEffect, useRef, useState } from "react"
import { ShoppingCart } from "lucide-react"
import * as tf from "@tensorflow/tfjs"

const messageTemplates = [
  (n: number) => `${n} people are viewing this`,
  (n: number) => `${n} people have purchased in the last 10 minutes`,
  (n: number) => `${n} people added a product to the cart`,
  (n: number) => `${n} people are buying now`
]

const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min

const COOLDOWN = 15000
const MAX_PER_SESSION = 3

export function SocialNotifications() {
  const [visible, setVisible] = useState(false)
  const [currentMessage, setCurrentMessage] = useState(0)
  const [numbers, setNumbers] = useState([0, 0, 0, 0])
  const [model, setModel] = useState<tf.LayersModel | null>(null)

  const startTime = useRef(Date.now())
  const lastScroll = useRef(0)
  const clicks = useRef(0)
  const lastShown = useRef(0)
  const shownCount = useRef(0)

  // 1️⃣ Load model (FIXED)
  useEffect(() => {
    const loadModel = async () => {
      const res = await fetch("/model-intent.json")
      const json = await res.json()

      const m = await tf.models.modelFromJSON({
        modelTopology: json
      } as any)

      setModel(m)
    }

    loadModel()
  }, [])

  // 2️⃣ Track user behavior
  useEffect(() => {
    const onScroll = () => {
      lastScroll.current =
        window.scrollY /
        (document.body.scrollHeight - window.innerHeight)
    }

    const onClick = () => clicks.current++

    window.addEventListener("scroll", onScroll, { passive: true })
    document.addEventListener("click", onClick)

    return () => {
      window.removeEventListener("scroll", onScroll)
      document.removeEventListener("click", onClick)
    }
  }, [])

  // 3️⃣ Prediction loop
  useEffect(() => {
    if (!model) return

    const predict = async () => {
      if (shownCount.current >= MAX_PER_SESSION) return

      const now = Date.now()
      if (now - lastShown.current < COOLDOWN) return

      const timeOnPage = (now - startTime.current) / 1000

      const input = tf.tensor2d([[
        lastScroll.current,
        Math.min(timeOnPage / 60, 1),
        Math.min(clicks.current / 5, 1)
      ]])

      const prediction = model.predict(input) as tf.Tensor
      const prob = (await prediction.data())[0]

      // 🔥 ML + heuristics
      const intent =
        prob * 0.6 +
        lastScroll.current * 0.25 +
        Math.min(clicks.current / 3, 1) * 0.15

      if (intent > 0.45) {
        shownCount.current++
        lastShown.current = now

        setCurrentMessage(p => (p + 1) % messageTemplates.length)
        setNumbers([
          rand(12, 58),
          rand(3, 22),
          rand(1, 6),
          rand(1, 3)
        ])

        setVisible(true)
        setTimeout(() => setVisible(false), 4000)
      }

      input.dispose()
      prediction.dispose()
    }

    const interval = setInterval(predict, 8000)
    return () => clearInterval(interval)
  }, [model])

  if (!visible) return null

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50">
      <div className="rounded-lg border bg-background/90 backdrop-blur px-4 py-2 shadow-lg">
        <p className="flex items-center gap-2 text-xs md:text-sm font-medium text-green-600">
          <ShoppingCart className="h-4 w-4" />
          {messageTemplates[currentMessage](numbers[currentMessage])}
        </p>
      </div>
    </div>
  )
}

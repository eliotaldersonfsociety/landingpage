"use client"

import { useEffect, useState } from "react"

type MessageConfig = {
  min: number
  max: number
  message: string
  cta?: string
}

const MESSAGES: MessageConfig[] = [
  {
    min: 0.4,
    max: 0.55,
    message: "Some people are viewing this product right now",
  },
  {
    min: 0.55,
    max: 0.7,
    message: "This product has sold multiple times today",
  },
  {
    min: 0.7,
    max: 0.85,
    message: "Limited stock for today's deliveries",
  },
  {
    min: 0.85,
    max: 1,
    message: "Only a few units left",
  },
]

export function UrgencyNotification() {
  const [score, setScore] = useState<number | null>(null)
  const [visible, setVisible] = useState(false)

  /* ===============================
     READ SCORE
  =============================== */
  useEffect(() => {
    const i = setInterval(() => {
      const s = (window as any).__conversionScore
      if (typeof s === "number") setScore(s)
    }, 1200)

    return () => clearInterval(i)
  }, [])

  /* ===============================
     VISIBILITY CYCLE (REPTIL MODE)
  =============================== */
  useEffect(() => {
    if (!score || score < 0.4) return

    setVisible(true)

    const hide = setTimeout(() => setVisible(false), 7000)
    const show = setTimeout(() => setVisible(true), 26000)

    return () => {
      clearTimeout(hide)
      clearTimeout(show)
    }
  }, [score])

  if (!score || score < 0.4 || !visible) return null

  const config = MESSAGES.find(
    m => score >= m.min && score < m.max
  )

  if (!config) return null

  return (
    <div
      className="
        fixed bottom-5 right-5 z-40 max-w-xs
        bg-white/90 backdrop-blur-md
        text-zinc-900
        px-4 py-3
        rounded-xl
        shadow-md
        border border-zinc-200
        text-sm
        animate-[fadeIn_0.6s_ease-out]
      "
    >
      <p className="leading-snug">{config.message}</p>

    </div>
  )
}

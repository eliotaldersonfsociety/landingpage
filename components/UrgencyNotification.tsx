"use client"

import { useEffect, useState } from "react"

type MessageConfig = {
  min: number
  max: number
  message: string
  cta?: string
  color: string
}

const MESSAGES: MessageConfig[] = [
  {
    min: 0.4,
    max: 0.55,
    message: "👀 Otras personas están viendo este producto ahora mismo",
    color: "bg-zinc-800",
  },
  {
    min: 0.55,
    max: 0.65,
    message: "⭐ Producto viral · Muy bien calificado hoy",
    color: "bg-indigo-600",
  },
  {
    min: 0.65,
    max: 0.75,
    message: "🔥 Quedan pocas unidades disponibles",
    cta: "Agregar al carrito",
    color: "bg-orange-600",
  },
  {
    min: 0.75,
    max: 0.85,
    message: "🚨 Alta demanda · Podría agotarse hoy",
    cta: "Agregar ahora",
    color: "bg-red-600",
  },
  {
    min: 0.85,
    max: 1,
    message: "⏰ Última unidad disponible · Compra antes que otro",
    cta: "Comprar ahora",
    color: "bg-red-700",
  },
]

export function UrgencyNotification() {
  const [score, setScore] = useState<number | null>(null)

  useEffect(() => {
    const i = setInterval(() => {
      const s = (window as any).__conversionScore
      if (typeof s === "number") setScore(s)
    }, 1200)

    return () => clearInterval(i)
  }, [])

  if (!score || score < 0.4) return null

  const config = MESSAGES.find(
    m => score >= m.min && score < m.max
  )

  if (!config) return null

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 max-w-xs text-white p-4 rounded-2xl shadow-2xl transition-all animate-in slide-in-from-bottom ${config.color}`}
    >
      <p className="text-sm font-semibold leading-snug mb-3">
        {config.message}
      </p>

      {config.cta && (
        <button
          onClick={() => {
            document
              .querySelector('[data-action="add-to-cart"]')
              ?.dispatchEvent(
                new MouseEvent("click", { bubbles: true })
              )
          }}
          className="w-full bg-white text-black rounded-xl py-2 text-sm font-bold hover:scale-[1.02] transition"
        >
          {config.cta}
        </button>
      )}
    </div>
  )
}

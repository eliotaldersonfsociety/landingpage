"use client"

import { useEffect, useRef, useState } from "react"
import * as tf from "@tensorflow/tfjs"

interface DynamicPricingProps {
  basePrice: number
  productId: string
}

export function DynamicPricing({
  basePrice,
  productId,
}: DynamicPricingProps) {
  const [benefit, setBenefit] = useState<null | "shipping" | "vip">(null)
  const [modelLoaded, setModelLoaded] = useState(false)

  const modelRef = useRef<tf.LayersModel | null>(null)

  // tracking
  const scrollRef = useRef(0)
  const clicksRef = useRef(0)
  const startTimeRef = useRef(Date.now())
  const benefitAppliedRef = useRef(false)

  // ===============================
  // 1️⃣ Load model
  // ===============================
  useEffect(() => {
    let mounted = true

    async function loadModel() {
      try {
        const model = await tf.loadLayersModel("/model/model.json")
        if (mounted) {
          modelRef.current = model
          setModelLoaded(true)
        }
      } catch (err) {
        console.error("❌ Error loading model:", err)
      }
    }

    loadModel()
    return () => {
      mounted = false
    }
  }, [])

  // ===============================
  // 2️⃣ Tracking
  // ===============================
  useEffect(() => {
    const onScroll = () => {
      const max =
        document.body.scrollHeight - window.innerHeight
      if (max <= 0) return
      scrollRef.current = Math.max(
        scrollRef.current,
        window.scrollY / max
      )
    }

    const onClick = () => {
      clicksRef.current += 1
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    document.addEventListener("click", onClick)

    return () => {
      window.removeEventListener("scroll", onScroll)
      document.removeEventListener("click", onClick)
    }
  }, [])

  // ===============================
  // 3️⃣ Inference
  // ===============================
  useEffect(() => {
    if (!modelLoaded || !modelRef.current) return

    const interval = setInterval(async () => {
      if (benefitAppliedRef.current) return

      const timeOnPage =
        (Date.now() - startTimeRef.current) / 1000

      // ⚡ Quick hook (no ML)
      if (
        timeOnPage > 2 &&
        (scrollRef.current > 0.15 || clicksRef.current >= 1)
      ) {
        setBenefit("shipping")
        benefitAppliedRef.current = true

        console.log("⚡ Quick benefit activated", {
          productId,
        })
        return
      }

      // 🤖 ML
      const input = tf.tensor2d([[ 
        Math.min(scrollRef.current, 1),
        Math.min(timeOnPage / 60, 1),
        Math.min(clicksRef.current / 10, 1),
      ]])

      try {
        if (!modelRef.current) {
          input.dispose()
          return
        }

        const prediction =
          modelRef.current.predict(input) as tf.Tensor

        const prob = (await prediction.data())[0]

        if (prob > 0.65) {
          setBenefit("vip")
          benefitAppliedRef.current = true

          console.log("🤖 High intent detected", {
            productId,
            prob,
          })
        }

        prediction.dispose()
      } finally {
        input.dispose()
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [modelLoaded, productId])

  // ===============================
  // 4️⃣ UI
  // ===============================
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span className="text-sm line-through text-muted-foreground">
          $80.00
        </span>
        <span className="text-xl font-bold text-green-700">
          ${basePrice.toFixed(2)}
        </span>
      </div>

      {benefit === "shipping" && (
        <div className="text-sm font-semibold text-green-600">
          🎁 FREE shipping unlocked
        </div>
      )}

      {benefit === "vip" && (
        <div className="text-sm font-semibold text-amber-600">
          🔥 VIP access · Stock reserved
        </div>
      )}
    </div>
  )
}

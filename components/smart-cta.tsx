"use client"

import { useEffect, useState } from "react"
import * as tf from "@tensorflow/tfjs"
import { createModel } from "@/lib/tf-model"

export function SmartCTA() {
  const [score, setScore] = useState<number | null>(null)

  useEffect(() => {
    async function run() {
      // Fetch training data
      const response = await fetch('/api/behavior')
      const data = await response.json()

      if (data.length > 0) {
        const model = createModel()

        // Prepare training data
        const inputs = data.map((d: any) => [d.scroll, d.time, d.clicks])
        // Better dummy labels: 1 if engaged (high time and clicks), 0 otherwise
        const labels = data.map((d: any) => (d.time > 10000 && d.clicks > 5) ? 1 : 0)

        const xs = tf.tensor2d(inputs)
        const ys = tf.tensor1d(labels)

        // Train the model
        await model.fit(xs, ys, {
          epochs: 10,
          callbacks: {
            onEpochEnd: (epoch, logs) => {
              console.log(`Epoch ${epoch}: loss = ${logs?.loss}`)
            }
          }
        })

        // Predict current behavior
        const currentInput = tf.tensor2d([[0.8, 120, 2]]) // Example
        const prediction = model.predict(currentInput) as tf.Tensor
        const value = (await prediction.data())[0]
        setScore(value)

        xs.dispose()
        ys.dispose()
        currentInput.dispose()
        prediction.dispose()
      } else {
        // Fallback to demo
        const model = createModel()
        const input = tf.tensor2d([[0.8, 120, 2]])
        const prediction = model.predict(input) as tf.Tensor
        const value = (await prediction.data())[0]
        setScore(value)
        input.dispose()
        prediction.dispose()
      }
    }

    run()
  }, [])

  if (score === null) return null

  if (score > 0.7)
    return <button className="cta">🔥 Comprar ahora</button>

  if (score > 0.4)
    return <button className="cta">🎁 10% descuento</button>

  return <button className="cta">📩 Guía gratis</button>
}

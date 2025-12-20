"use client"

import { useEffect, useState } from "react"
import * as tf from "@tensorflow/tfjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DynamicPricingProps {
  basePrice: number
  productId: string
}

export function DynamicPricing({ basePrice, productId }: DynamicPricingProps) {
  const [adjustedPrice, setAdjustedPrice] = useState(basePrice)
  const [discount, setDiscount] = useState(0)

  useEffect(() => {
    async function calculateDynamicPrice() {
      try {
        const response = await fetch('/api/behavior')
        const behaviorData = await response.json()

        if (behaviorData.length > 3) {
          // Create a simple model to predict willingness to pay
          const model = tf.sequential()
          model.add(tf.layers.dense({ inputShape: [3], units: 4, activation: 'relu' }))
          model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }))
          model.compile({ optimizer: 'adam', loss: 'binaryCrossentropy' })

          // Prepare training data
          const inputs = behaviorData.map((d: any) => [d.scroll, d.time / 10000, d.clicks / 10])
          // Assume higher engagement means willing to pay more
          const labels = behaviorData.map((d: any) =>
            (d.scroll > 0.7 && d.time > 15000 && d.clicks > 8) ? 1 : 0
          )

          const xs = tf.tensor2d(inputs)
          const ys = tf.tensor1d(labels)

          await model.fit(xs, ys, { epochs: 5, verbose: 0 })

          // Get current user behavior (simulated)
          const currentBehavior = [0.6, 12000, 5] // Example
          const prediction = model.predict(tf.tensor2d([currentBehavior])) as tf.Tensor
          const willingness = (await prediction.data())[0]

          // Adjust price based on willingness
          let newPrice = basePrice
          let discountPercent = 0

          if (willingness > 0.8) {
            // High willingness - slight increase
            newPrice = basePrice * 1.05
          } else if (willingness > 0.5) {
            // Medium willingness - no change
            newPrice = basePrice
          } else {
            // Low willingness - offer discount
            discountPercent = 50
            newPrice = basePrice * 0.5
          }

          setAdjustedPrice(newPrice)
          setDiscount(discountPercent)

          // Cleanup
          xs.dispose()
          ys.dispose()
          prediction.dispose()
        }
      } catch (error) {
        console.error('Error calculating dynamic price:', error)
      }
    }

    calculateDynamicPrice()
  }, [basePrice, productId])

  return (
    <div className="flex items-center gap-2">
      {discount > 0 && (
        <span className="text-sm text-red-500 font-semibold">
          -{discount}% OFF
        </span>
      )}
      <span className={`text-lg font-bold ${adjustedPrice < basePrice ? 'text-green-600' : adjustedPrice > basePrice ? 'text-orange-600' : 'text-gray-900'}`}>
        ${adjustedPrice.toFixed(2)}
      </span>
      {adjustedPrice !== basePrice && (
        <span className="text-sm text-muted-foreground line-through">
          ${basePrice.toFixed(2)}
        </span>
      )}
    </div>
  )
}
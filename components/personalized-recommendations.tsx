"use client"

import { useEffect, useState } from "react"
import * as tf from "@tensorflow/tfjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { productsStorage, type Product } from "@/lib/store"

export function PersonalizedRecommendations() {
  const [recommendations, setRecommendations] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function generateRecommendations() {
      try {
        // Fetch behavior data
        const response = await fetch('/api/behavior')
        const behaviorData = await response.json()

        if (behaviorData.length > 5) {
          // Simple collaborative filtering based on behavior patterns
          const products = productsStorage.get()

          // Score products based on user engagement patterns
          const scoredProducts = products.map(product => {
            let score = 0

            // Higher score for products that match user behavior patterns
            const avgScroll = behaviorData.reduce((sum: number, d: any) => sum + d.scroll, 0) / behaviorData.length
            const avgTime = behaviorData.reduce((sum: number, d: any) => sum + d.time, 0) / behaviorData.length
            const avgClicks = behaviorData.reduce((sum: number, d: any) => sum + d.clicks, 0) / behaviorData.length

            // Products get higher scores if user is engaged
            if (avgScroll > 0.5 && avgTime > 5000 && avgClicks > 3) {
              score += 10
            }

            // Random factor for variety
            score += Math.random() * 5

            return { product, score }
          })

          // Sort by score and take top 2 for cart
          const topRecommendations = scoredProducts
            .sort((a, b) => b.score - a.score)
            .slice(0, 2)
            .map(item => item.product)

          setRecommendations(topRecommendations)
        } else {
          // Fallback to random recommendations
          const products = productsStorage.get()
          const shuffled = [...products].sort(() => 0.5 - Math.random())
          setRecommendations(shuffled.slice(0, 2))
        }
      } catch (error) {
        console.error('Error generating recommendations:', error)
        // Fallback
        const products = productsStorage.get()
        setRecommendations(products.slice(0, 3))
      } finally {
        setIsLoading(false)
      }
    }

    generateRecommendations()
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recomendaciones Personalizadas</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Cargando recomendaciones...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Te podrían interesar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {recommendations.map((product) => (
            <div key={product.id} className="border rounded-lg p-2">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-20 object-cover rounded mb-1"
              />
              <h3 className="font-semibold text-xs line-clamp-2">{product.name}</h3>
              <p className="text-xs text-muted-foreground mb-1">${product.price.toFixed(2)}</p>
              <button className="w-full bg-orange-500 text-white py-1 px-2 rounded text-xs hover:bg-orange-600">
                Agregar
              </button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
"use client"

import { useEffect, useState } from "react"
import * as tf from "@tensorflow/tfjs"
import { Card, CardContent } from "@/components/ui/card"

const testimonials = [
  {
    text: "Amazing quality! The Labubu monster exceeded my expectations as a collectible.",
    author: "Maria G.",
    type: "quality"
  },
  {
    text: "Super fast shipping. Received my Labubu monster in just 2 days.",
    author: "Carlos M.",
    type: "speed"
  },
  {
    text: "Excellent customer service. They helped me with all my questions about Labubu.",
    author: "Ana L.",
    type: "support"
  },
  {
    text: "Great value for money. Totally worth it for this collectible monster.",
    author: "Juan P.",
    type: "value"
  },
  {
    text: "Easy to use platform. Made collecting Labubu monsters fun and simple.",
    author: "Sofia R.",
    type: "usability"
  }
]

function AITestimonials() {
  const [currentTestimonial, setCurrentTestimonial] = useState(testimonials[0])

  useEffect(() => {
    async function selectTestimonial() {
      try {
        const response = await fetch('/api/behavior')
        const behaviorData = await response.json()

        if (behaviorData.length > 2) {
          // Analyze user behavior to determine which testimonial to show
          const avgScroll = behaviorData.reduce((sum: number, d: any) => sum + d.scroll, 0) / behaviorData.length
          const avgTime = behaviorData.reduce((sum: number, d: any) => sum + d.time, 0) / behaviorData.length
          const avgClicks = behaviorData.reduce((sum: number, d: any) => sum + d.clicks, 0) / behaviorData.length

          let selectedType = "quality" // default

          if (avgTime > 20000 && avgClicks > 10) {
            // Highly engaged user - show quality testimonial
            selectedType = "quality"
          } else if (avgScroll > 0.8) {
            // User scrolled a lot - show usability
            selectedType = "usability"
          } else if (avgTime > 10000) {
            // Spent time - show value
            selectedType = "value"
          } else if (avgClicks > 5) {
            // Clicked a lot - show support
            selectedType = "support"
          } else {
            // Default - show speed
            selectedType = "speed"
          }

          const matchingTestimonials = testimonials.filter(t => t.type === selectedType)
          if (matchingTestimonials.length > 0) {
            setCurrentTestimonial(matchingTestimonials[Math.floor(Math.random() * matchingTestimonials.length)])
          }
        } else {
          // Rotate testimonials randomly
          const interval = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * testimonials.length)
            setCurrentTestimonial(testimonials[randomIndex])
          }, 5000)

          return () => clearInterval(interval)
        }
      } catch (error) {
        console.error('Error selecting testimonial:', error)
        // Fallback to rotation
        const interval = setInterval(() => {
          const randomIndex = Math.floor(Math.random() * testimonials.length)
          setCurrentTestimonial(testimonials[randomIndex])
        }, 5000)

        return () => clearInterval(interval)
      }
    }

    selectTestimonial()
  }, [])

  return (
    <Card className="max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="text-center">
          <div className="mb-4">
            <div className="flex justify-center mb-2">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-yellow-400 text-lg">⭐</span>
              ))}
            </div>
          </div>
          <blockquote className="text-lg italic mb-4">
            "{currentTestimonial.text}"
          </blockquote>
          <cite className="text-sm font-semibold text-muted-foreground">
            - {currentTestimonial.author}
          </cite>
        </div>
      </CardContent>
    </Card>
  )
}

export default AITestimonials
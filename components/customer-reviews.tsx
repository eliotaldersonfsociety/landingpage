"use client"
import { Star } from "lucide-react"
import { useState, useEffect } from "react"

const reviews = [
  "Amazing Labubu monster! It arrived perfectly in Hot Springs, Arkansas. The collectible is so cute and well-made.",
  "Fast delivery to Hot Springs, Arkansas! My Labubu monster exceeded expectations. Great quality from Pop Mart.",
  "Love my new Labubu! Shipped quickly to Arkansas and arrived in perfect condition. Such a fun collectible.",
  "The Labubu monster arrived safely in Hot Springs. Excellent packaging and the figure is adorable.",
  "Super happy with my Labubu purchase! Delivered to Arkansas on time, and it's a fantastic addition to my collection.",
  "Labubu monster is incredible! Arrived in Hot Springs, Arkansas without any issues. Highly recommend.",
  "Quick shipping to Arkansas! My Labubu collectible is even cuter in person. Pop Mart quality.",
  "Received my Labubu in Hot Springs perfectly. The monster figure brings so much joy. Great buy!",
  "Labubu arrived fast to Arkansas. The collectible is detailed and fun. Worth every penny.",
  "Excited about my Labubu monster! Shipped to Hot Springs, Arkansas safely. Pop Mart never disappoints."
]

export function CustomerReviews() {
  const [currentReview, setCurrentReview] = useState(0)
  const [userId, setUserId] = useState(1)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentReview((prev) => (prev + 1) % reviews.length)
      setUserId(Math.floor(Math.random() * 99) + 1)
    }, 8000) // Change every 8 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-start gap-3 mt-6">
      <img
        src={`https://randomuser.me/api/portraits/men/${userId}.jpg`}
        alt="Customer"
        className="w-10 h-10 rounded-full border-2 border-orange-500 flex-shrink-0"
      />
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4].map((star) => (
            <Star key={star} className="h-4 w-4 fill-orange-500 text-orange-500" />
          ))}
          <Star className="h-4 w-4 fill-orange-500/50 text-orange-500" />
          <span className="ml-1 text-xs font-medium text-muted-foreground">4.5</span>
          <span className="ml-1 text-sm">🇺🇸</span>
        </div>
        <p className="text-sm text-muted-foreground max-w-xs">
          {reviews[currentReview]}
        </p>
      </div>
    </div>
  )
}
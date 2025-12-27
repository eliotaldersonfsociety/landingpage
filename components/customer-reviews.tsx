"use client"

import { Star } from "lucide-react"
import { useState, useEffect } from "react"

const reviews = [
  "Amazing Labubu monster! It arrived perfectly in Hot Springs. The collectible is so cute and well-made.",
  "Fast delivery to Hot Springs! My Labubu exceeded expectations. Great quality from Pop Mart.",
  "Love my new Labubu! Shipped quickly and arrived in perfect condition. Such a fun collectible.",
  "The Labubu monster arrived safely in Hot Springs. Excellent packaging and adorable figure.",
  "Super happy with my Labubu purchase! Delivered on time and it’s a great addition to my collection.",
  "Labubu monster is incredible! Arrived without any issues. Highly recommend.",
  "Quick shipping! My Labubu collectible is even cuter in person. Amazing quality.",
  "Received my Labubu perfectly. This little monster brings so much joy. Great buy!",
  "Labubu arrived fast. The collectible is detailed and fun. Worth every penny.",
  "Excited about my Labubu monster! Shipped safely and arrived fast. Never disappoints."
]

const users = [
  { name: "Sarah M.", location: "Hot Springs, AR", gender: "women" },
  { name: "Michael T.", location: "Arkansas", gender: "men" },
  { name: "Emily R.", location: "Hot Springs, AR", gender: "women" },
  { name: "David K.", location: "Arkansas", gender: "men" },
  { name: "Jessica L.", location: "Hot Springs, AR", gender: "women" },
  { name: "Chris P.", location: "Arkansas", gender: "men" },
  { name: "Amanda S.", location: "Hot Springs, AR", gender: "women" },
  { name: "John B.", location: "Arkansas", gender: "men" },
  { name: "Lauren H.", location: "Hot Springs, AR", gender: "women" },
  { name: "Brian W.", location: "Arkansas", gender: "men" }
]

export function CustomerReviews() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % reviews.length)
    }, 8000)

    return () => clearInterval(interval)
  }, [])

  const user = users[index % users.length]
  const avatarId = (index % 50) + 1

  return (
    <div className="flex items-start gap-3 mt-6">
      {/* Avatar */}
      <img
        src={`https://randomuser.me/api/portraits/${user.gender}/${avatarId}.jpg`}
        alt={user.name}
        className="w-10 h-10 rounded-full border-2 border-orange-500 flex-shrink-0"
      />

      {/* Content */}
      <div className="flex flex-col gap-1">
        {/* Username + location */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">
            {user.name}
          </span>
          <span className="text-xs text-muted-foreground">
            {user.location}
          </span>
          <span className="text-sm">🇺🇸</span>
        </div>

        {/* Stars */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4].map((star) => (
            <Star
              key={star}
              className="h-4 w-4 fill-orange-500 text-orange-500"
            />
          ))}
          <Star className="h-4 w-4 fill-orange-500/50 text-orange-500" />
          <span className="ml-1 text-xs font-medium text-muted-foreground">
            4.5
          </span>
        </div>

        {/* Review text */}
        <p className="text-sm text-muted-foreground max-w-xs">
          {reviews[index]}
        </p>
      </div>
    </div>
  )
}

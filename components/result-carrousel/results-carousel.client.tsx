"use client"

import { useState } from "react"
import { ResultsCarousel } from "./results-carousel"

export function ResultsCarouselClient() {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <ResultsCarousel
      isPlaying={isPlaying}
      onPlay={() => setIsPlaying(true)}
      onEnded={() => setIsPlaying(false)}
    />
  )
}

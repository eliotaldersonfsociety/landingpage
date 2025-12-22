"use client"
import { useEffect, useState } from "react"

export function useConversionScore() {
  const [score, setScore] = useState(0)

  useEffect(() => {
    const i = setInterval(() => {
      setScore((window as any).__conversionScore || 0)
    }, 500)

    return () => clearInterval(i)
  }, [])

  return score
}

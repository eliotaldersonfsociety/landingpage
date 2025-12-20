"use client"

import { useEffect, useRef } from "react"

type EventData = {
  scroll?: number
  time: number
  clicks?: number
}

export function BehaviorTracker() {
  const startTime = useRef(Date.now())
  const clicks = useRef(0)
  const lastScroll = useRef(0)
  const buffer = useRef<Partial<EventData>[]>([])
  const lastSend = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      lastScroll.current =
        window.scrollY /
        (document.body.scrollHeight - window.innerHeight)
    }

    const onClick = () => {
      clicks.current++
    }

    const flush = () => {
      const now = Date.now()
      if (now - lastSend.current < 5000) return

      if (buffer.current.length === 0) return

      const payload = {
        events: buffer.current,
      }

      navigator.sendBeacon(
        "/api/behavior",
        JSON.stringify(payload)
      )

      buffer.current = []
      lastSend.current = now
    }

    const tick = () => {
      buffer.current.push({
        scroll: lastScroll.current,
        clicks: clicks.current,
        time: Date.now() - startTime.current,
      })

      flush()
    }

    const interval = setInterval(tick, 2000)

    window.addEventListener("scroll", onScroll, { passive: true })
    document.addEventListener("click", onClick)

    return () => {
      clearInterval(interval)
      window.removeEventListener("scroll", onScroll)
      document.removeEventListener("click", onClick)
    }
  }, [])

  return null
}

"use client"

import { useEffect, useRef } from "react"

type EventData = {
  scroll: number
  time: number
  clicks: number
  ctaSeen?: number
  converted?: number
}

export function BehaviorTracker() {
  const startTime = useRef(Date.now())
  const clicks = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const scroll =
        window.scrollY /
        (document.body.scrollHeight - window.innerHeight)

      sendEvent({ scroll })
    }

    const onClick = () => {
      clicks.current++
      sendEvent({ clicks: clicks.current })
    }

    window.addEventListener("scroll", onScroll)
    document.addEventListener("click", onClick)

    return () => {
      window.removeEventListener("scroll", onScroll)
      document.removeEventListener("click", onClick)
    }
  }, [])

  function sendEvent(partial: Partial<EventData>) {
    fetch("/api/behavior", {
      method: "POST",
      body: JSON.stringify({
        ...partial,
        time: Date.now() - startTime.current,
      }),
    })
  }

  return null
}

"use client"

import { useEffect, useRef } from "react"

type EventData = {
  scroll?: number
  time: number
  clicks?: number
  ctaSeen?: number
  converted?: number
}

export function BehaviorTracker() {
  const startTime = useRef(Date.now())
  const clicks = useRef(0)
  const lastScroll = useRef(0)

  const sendData = (extra: { ctaSeen?: number, converted?: number } = {}) => {
    const data: EventData = {
      scroll: lastScroll.current,
      time: Date.now() - startTime.current,
      clicks: clicks.current,
      ...extra
    }

    navigator.sendBeacon(
      "/api/behavior",
      JSON.stringify({ events: [data] })
    )
  }

  useEffect(() => {
    const onScroll = () => {
      lastScroll.current =
        window.scrollY / (document.body.scrollHeight - window.innerHeight)
    }

    const onClick = (e: Event) => {
      clicks.current++

      const target = e.target as HTMLElement

      // 🔹 Agregar al carrito
      if (
        target.closest("button, a") &&
        (target.textContent?.toLowerCase().includes("agregar al carrito") ||
          target.closest('[data-action="add-to-cart"]'))
      ) {
        sendData({ ctaSeen: 1 })
      }

      // 🔹 Checkout
      if (
        target.closest("button, a") &&
        (target.getAttribute("href") === "/checkout" ||
          target.textContent?.toLowerCase().includes("checkout") ||
          target.closest('[data-action="checkout"]'))
      ) {
        sendData({ converted: 1 })
      }
    }

    // 🔹 Video play
    const onVideoPlay = (e: Event) => {
      if ((e.target as HTMLElement).tagName === "VIDEO") {
        sendData()
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    document.addEventListener("click", onClick)
    document.addEventListener("play", onVideoPlay, true)

    return () => {
      window.removeEventListener("scroll", onScroll)
      document.removeEventListener("click", onClick)
      document.removeEventListener("play", onVideoPlay, true)
    }
  }, [])

  return null
}

"use client"

import { useEffect, useRef } from "react"
import * as tf from "@tensorflow/tfjs"

type EventData = {
  scroll: number
  clicks: number
  ctaSeen?: number
  videoPlayed?: number
  converted?: number
}

const MAX_EVENTS = 500 // límite de eventos en localStorage

export function BehaviorTracker() {
  const startTime = useRef(Date.now())
  const clicks = useRef(0)
  const lastScroll = useRef(0)
  const modelRef = useRef<tf.Sequential | null>(null)

  // Guardar y cargar eventos resumidos
  const saveEvent = (event: EventData) => {
    const stored = JSON.parse(localStorage.getItem("events") || "[]")
    stored.push(event)
    if (stored.length > MAX_EVENTS) stored.shift() // eliminar el más viejo
    localStorage.setItem("events", JSON.stringify(stored))
  }

  // Crear modelo simple si no existe
  const createModel = () => {
    const model = tf.sequential()
    model.add(tf.layers.dense({ inputShape: [4], units: 8, activation: "relu" }))
    model.add(tf.layers.dense({ units: 1, activation: "sigmoid" }))
    model.compile({ optimizer: "adam", loss: "binaryCrossentropy", metrics: ["accuracy"] })
    modelRef.current = model
  }

  // Reentrenar modelo con datos locales
  const trainModel = async () => {
    const stored: EventData[] = JSON.parse(localStorage.getItem("events") || "[]")
    if (stored.length < 5) return // esperar a tener datos suficientes

    const xs = stored.map(e => [
      e.scroll,
      e.clicks,
      e.ctaSeen || 0,
      e.videoPlayed || 0
    ])
    const ys = stored.map(e => e.converted || 0)

    const xsTensor = tf.tensor2d(xs)
    const ysTensor = tf.tensor2d(ys, [ys.length, 1])

    await modelRef.current?.fit(xsTensor, ysTensor, { epochs: 3 })
    xsTensor.dispose()
    ysTensor.dispose()
  }

  useEffect(() => {
    if (!modelRef.current) createModel()

    const onScroll = () => {
      lastScroll.current =
        window.scrollY / (document.body.scrollHeight - window.innerHeight)
    }

    const onClick = (e: Event) => {
      clicks.current++
      const target = e.target as HTMLElement
      const event: EventData = {
        scroll: lastScroll.current,
        clicks: clicks.current
      }

      if (target.closest("button, a")) {
        if (target.textContent?.toLowerCase().includes("agregar al carrito") ||
            target.closest('[data-action="add-to-cart"]')) {
          event.ctaSeen = 1
        }
        if (target.getAttribute("href") === "/checkout" ||
            target.textContent?.toLowerCase().includes("checkout") ||
            target.closest('[data-action="checkout"]')) {
          event.converted = 1
        }
      }

      saveEvent(event)
      trainModel()
    }

    const onVideoPlay = (e: Event) => {
      const event: EventData = {
        scroll: lastScroll.current,
        clicks: clicks.current,
        videoPlayed: 1
      }
      saveEvent(event)
      trainModel()
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

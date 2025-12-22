"use client"

import { useEffect, useRef } from "react"
import * as tf from "@tensorflow/tfjs"
import localforage from "localforage"

type EventData = {
  scroll: number
  time: number
  clicks: number
  ctaSeen: number
  converted: number
}

const STORAGE_KEY = "behavior-events"
const MIN_EVENTS_TO_TRAIN = 8

export function BehaviorTracker({
  baseModelUrl = "/model/model.json",
}: {
  baseModelUrl?: string
}) {
  const startTime = useRef(Date.now())
  const clicks = useRef(0)
  const lastScroll = useRef(0)
  const modelRef = useRef<tf.LayersModel | null>(null)

  /* ---------- INIT LOCALFORAGE ---------- */
  useEffect(() => {
    localforage.config({
      name: "behavior-ai",
      storeName: "events",
    })
  }, [])

  /* ---------- TRAIN MODEL ---------- */
  const trainIncremental = async (events: EventData[]) => {
    if (!modelRef.current || events.length < 2) return

    const xs = tf.tensor2d(
      events.map(e => [
        e.scroll,
        e.time / 10000,
        Math.min(e.clicks, 10),
      ])
    )

    const ys = tf.tensor2d(events.map(e => [e.converted]))

    await modelRef.current.fit(xs, ys, {
      epochs: 3,
      batchSize: 4,
      shuffle: true,
    })

    xs.dispose()
    ys.dispose()

    await modelRef.current.save("indexeddb://behavior-model")
    await localforage.removeItem(STORAGE_KEY)

    console.log("🧠 Entrenado con", events.length, "eventos")
  }

  /* ---------- SCORE ---------- */
  const predictScore = async () => {
    if (!modelRef.current) return

    const input = tf.tensor2d([[
      lastScroll.current,
      (Date.now() - startTime.current) / 10000,
      Math.min(clicks.current, 10),
    ]])

    const output = modelRef.current.predict(input) as tf.Tensor
    const score = (await output.data())[0]

    input.dispose()
    output.dispose()

    ;(window as any).__conversionScore = score
  }

  /* ---------- HANDLE EVENT ---------- */
  const handleEvent = async (
    extra: Partial<Pick<EventData, "ctaSeen" | "converted">> = {}
  ) => {
    const event: EventData = {
      scroll: lastScroll.current,
      time: Date.now() - startTime.current,
      clicks: clicks.current,
      ctaSeen: extra.ctaSeen ? 1 : 0,
      converted: extra.converted ? 1 : 0,
    }

    const stored =
      (await localforage.getItem<EventData[]>(STORAGE_KEY)) || []

    stored.push(event)
    await localforage.setItem(STORAGE_KEY, stored)

    await predictScore()

    if (event.converted || stored.length >= MIN_EVENTS_TO_TRAIN) {
      await trainIncremental(stored)
    }
  }

  /* ---------- LOAD MODEL ---------- */
  useEffect(() => {
    const load = async () => {
      try {
        modelRef.current = await tf.loadLayersModel(
          "indexeddb://behavior-model"
        )
        console.log("Modelo desde IndexedDB")
      } catch {
        modelRef.current = await tf.loadLayersModel(baseModelUrl)
        await modelRef.current.save("indexeddb://behavior-model")
        console.log("Modelo base cargado")
      }
    }
    load()
  }, [baseModelUrl])

  /* ---------- LISTENERS ---------- */
  useEffect(() => {
    const onScroll = () => {
      lastScroll.current =
        window.scrollY /
        (document.body.scrollHeight - window.innerHeight)
    }

    const onClick = (e: Event) => {
      clicks.current++
      const el = e.target as HTMLElement

      if (
        el.closest('[data-action="add-to-cart"]') ||
        el.textContent?.toLowerCase().includes("agregar")
      ) {
        handleEvent({ ctaSeen: 1 })
      }

      if (
        el.closest('[data-action="checkout"]') ||
        el.textContent?.toLowerCase().includes("checkout")
      ) {
        handleEvent({ converted: 1 })
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    document.addEventListener("click", onClick)

    return () => {
      window.removeEventListener("scroll", onScroll)
      document.removeEventListener("click", onClick)
    }
  }, [])

  return null
}

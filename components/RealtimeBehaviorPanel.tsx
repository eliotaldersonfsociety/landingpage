"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useBehaviorAI } from "@/hooks/useBehaviorAI"

type RealtimeEvent = {
  type: string
  scroll?: number
  time?: number
  clicks?: number
  ctaSeen?: number
  addToCart?: number
  converted?: number
  country?: string
  ts: number
}

export function RealtimeBehaviorPanel() {
  const [events, setEvents] = useState<RealtimeEvent[]>([])
  const [connected, setConnected] = useState(false)

  // 🔹 Samples para IA
  const behaviorSamples = useMemo(
    () =>
      events
        .filter(
          (e) =>
            typeof e.scroll === "number" ||
            typeof e.clicks === "number" ||
            typeof e.ctaSeen === "number"
        )
        .map((e) => ({
          scroll: e.scroll ?? 0,
          time: e.time ?? 0,
          clicks: e.clicks ?? 0,
          ctaSeen: e.ctaSeen ?? 0,
          addToCart: e.converted ?? 0,
        })),
    [events]
  )

  const { ready, training, predict, level } =
    useBehaviorAI(behaviorSamples)

  // 🔹 SSE conexión
  useEffect(() => {
    const es = new EventSource("/api/realtime")

    es.onopen = () => setConnected(true)

    es.onmessage = (e) => {
      console.log("📡 SSE:", e.data)
      const data = JSON.parse(e.data)
      setEvents((prev) => [...prev.slice(-40), data])
    }

    es.onerror = () => {
      setConnected(false)
      es.close()
    }

    return () => es.close()
  }, [])

  const last = events[events.length - 1]

  const score =
    last && ready
      ? predict({
          scroll: last.scroll ?? 0,
          time: last.time ?? 0,
          clicks: last.clicks ?? 0,
          ctaSeen: last.ctaSeen ?? 0,
        })
      : 0

  return (
    <Card className="border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Realtime + IA</CardTitle>
        <Badge variant={connected ? "default" : "destructive"}>
          {connected ? "LIVE" : "OFFLINE"}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-3">

        {/* 🔢 CONTADORES */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded border px-2 py-1">
            📡 Eventos: <strong>{events.length}</strong>
          </div>
          <div className="rounded border px-2 py-1">
            🧠 Samples IA: <strong>{behaviorSamples.length}</strong>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          Nivel entrenamiento:{" "}
          {level > 0 ? `${level}+ eventos` : "—"}
        </div>

        {/* 🧠 ESTADO */}
        <p className="text-sm">
          Estado IA:{" "}
          {training ? (
            <span className="text-yellow-500">Entrenando…</span>
          ) : ready ? (
            <span className="text-green-600">Modelo listo</span>
          ) : (
            <span className="text-muted-foreground">Esperando datos</span>
          )}
        </p>

        {/* 🔥 SCORE */}
        {ready && score > 0.8 && (
          <Badge className="bg-red-500 text-white">
            🔥 Alta intención ({(score * 100).toFixed(0)}%)
          </Badge>
        )}

        {/* 🧪 DEBUG DATOS */}
        {last && (
          <div className="text-xs border rounded p-2 bg-muted/30 space-y-1">
            <div>scroll: {last.scroll ?? 0}</div>
            <div>time: {last.time ?? 0}</div>
            <div>clicks: {last.clicks ?? 0}</div>
            <div>ctaSeen: {last.ctaSeen ?? 0}</div>
            <div>addToCart: {last.addToCart ?? 0}</div>
          </div>
        )}

        {/* 📜 LOG */}
        <div className="max-h-64 overflow-y-auto border rounded-md">
          {events
            .slice()
            .reverse()
            .map((e, i) => (
              <div
                key={i}
                className="flex justify-between px-3 py-2 border-b text-sm"
              >
                <span>{e.type}</span>
                <span className="text-muted-foreground">
                  {e.country || "🌍"} ·{" "}
                  {new Date(e.ts).toLocaleTimeString()}
                </span>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  )
}

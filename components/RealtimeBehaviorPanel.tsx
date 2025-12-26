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

  const { ready, training, predict, level, nextLevel, eventsToNext } =
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

  // Unique countries
  const uniqueCountries = Array.from(new Set(events.map(e => e.country).filter(Boolean)))

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5 hover:shadow-lg transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-xl font-bold">Realtime + IA</CardTitle>
        <Badge variant={connected ? "default" : "destructive"} className="animate-pulse">
          {connected ? "LIVE" : "OFFLINE"}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-3">

        {/* 🔢 CONTADORES */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-lg border border-primary/20 bg-muted/20 px-3 py-2 hover:bg-muted/40 hover:scale-105 transition-all duration-200 shadow-sm">
            📡 Eventos: <strong className="text-primary">{events.length}</strong>
          </div>
          <div className="rounded-lg border border-secondary/20 bg-muted/20 px-3 py-2 hover:bg-muted/40 hover:scale-105 transition-all duration-200 shadow-sm">
            🧠 Nivel IA: <strong className="text-secondary">{level}</strong>
          </div>
        </div>

        <div className="text-xs text-muted-foreground bg-muted/10 rounded-md p-2 border border-border/30">
          Nivel IA: <span className="font-semibold text-foreground">{level}</span>
          {nextLevel && eventsToNext !== null && (
            <div className="text-xs mt-1">
              Próximo: <span className="font-semibold text-accent">{nextLevel}</span> ({eventsToNext} eventos)
            </div>
          )}
        </div>

        {/* 🧠 ESTADO */}
        <div className="text-sm bg-gradient-to-r from-muted/20 to-muted/10 rounded-lg p-3 border border-border/30">
          Estado IA:{" "}
          {training ? (
            <span className="text-yellow-500 font-semibold animate-pulse">Entrenando…</span>
          ) : ready ? (
            <span className="text-green-600 font-semibold">Modelo listo</span>
          ) : (
            <span className="text-muted-foreground font-semibold">Esperando datos</span>
          )}
        </div>

        {/* 🔥 SCORE */}
        {ready && (
          <div className="text-sm bg-gradient-to-r from-card to-muted/20 rounded-lg p-4 border border-border/30 shadow-sm">
            <div className="mb-3">
              <span className="font-medium">Intensidad de compra: </span>
              <span className={
                score > 0.8 ? "text-red-500 font-bold" :
                score > 0.5 ? "text-orange-500 font-bold" :
                "text-blue-500 font-bold"
              }>
                {score > 0.8 ? "🔥 Caliente" :
                 score > 0.5 ? "🌡️ Tibio" :
                 "❄️ Frío"} ({(score * 100).toFixed(0)}%)
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-3 mb-2 overflow-hidden shadow-inner">
              <div
                className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                  score > 0.8 ? "bg-gradient-to-r from-red-500 to-red-600" :
                  score > 0.5 ? "bg-gradient-to-r from-orange-500 to-orange-600" :
                  "bg-gradient-to-r from-blue-500 to-blue-600"
                }`}
                style={{ width: `${score * 100}%` }}
              ></div>
            </div>
            {score > 0.8 && (
              <Badge className="bg-red-500 text-white animate-bounce">
                🔥 Alta intención de compra
              </Badge>
            )}
          </div>
        )}

        {/* 🌍 COUNTRIES */}
        {uniqueCountries.length > 0 && (
          <div className="text-sm bg-gradient-to-r from-muted/10 to-accent/10 rounded-lg p-3 border border-border/30">
            <div className="font-medium mb-3 text-foreground">Países conectados:</div>
            <div className="flex flex-wrap gap-3">
              {uniqueCountries.map(country => (
                <Badge key={country} variant="outline" className="text-lg px-3 py-1 hover:scale-110 transition-transform duration-200">
                  {country}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* 🧪 DEBUG DATOS */}
        {last && (
          <div className="text-xs border border-primary/20 rounded-lg p-3 bg-gradient-to-br from-muted/30 to-primary/5 space-y-2 shadow-sm">
            <div className="font-semibold text-foreground mb-2">Último Evento:</div>
            <div className="grid grid-cols-2 gap-2">
              <div>📜 Scroll: <span className="font-mono text-primary">{last.scroll ?? 0}</span></div>
              <div>⏱️ Tiempo: <span className="font-mono text-secondary">{last.time ?? 0}</span></div>
              <div>👆 Clicks: <span className="font-mono text-accent">{last.clicks ?? 0}</span></div>
              <div>👁️ CTA Seen: <span className="font-mono text-green-600">{last.ctaSeen ?? 0}</span></div>
              <div>🛒 Add to Cart: <span className="font-mono text-orange-600">{last.addToCart ?? 0}</span></div>
            </div>
          </div>
        )}

        {/* 📜 LOG */}
        <div className="max-h-64 overflow-y-auto border border-border/50 rounded-lg bg-muted/10 shadow-inner">
          {events
            .slice()
            .reverse()
            .map((e, i) => (
              <div
                key={i}
                className="flex justify-between px-4 py-3 border-b border-border/30 text-sm hover:bg-muted/20 transition-colors duration-150 last:border-b-0"
              >
                <span className="font-medium text-foreground">{e.type}</span>
                <span className="text-muted-foreground font-mono">
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

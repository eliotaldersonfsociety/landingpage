import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { behavior } from "@/lib/schema"
import { addEvent, getRecentEvents } from "@/lib/shared-events"

// ─────────────────────────────────────────────
// SSE CLIENTS
let clients: ReadableStreamDefaultController[] = []

// ─────────────────────────────────────────────
// IN-MEMORY AGGREGATE
let aggregate = {
  scrollSum: 0,
  events: 0,
  clicks: 0,
  ctaSeen: 0,
  converted: 0,
  lastFlush: Date.now(),
  dirty: false,
}

// ─────────────────────────────────────────────
// GET: Behavior data or SSE
export async function GET(req: NextRequest) {
  const accept = req.headers.get("accept") || ""

  if (accept.includes("text/event-stream")) {
    // SSE stream
    const stream = new ReadableStream({
      start(controller) {
        clients.push(controller)
        controller.enqueue(`data: ${JSON.stringify({ type: "connected" })}\n\n`)
      },
      cancel(controller) {
        clients = clients.filter(c => c !== controller)
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } else {
    // Return behavior data for testimonials
    return Response.json(getRecentEvents())
  }
}

// ─────────────────────────────────────────────
// EVENTS (LANDING)
export async function POST(req: NextRequest) {
  let data
  try {
    data = await req.json()
  } catch (e) {
    console.error('Invalid JSON:', e)
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // 1️⃣ Add to shared events for testimonials
  addEvent(data)

  // 2️⃣ Broadcast realtime
  for (const client of clients) {
    try {
      client.enqueue(`data: ${JSON.stringify(data)}\n\n`)
    } catch {
      clients = clients.filter(c => c !== client)
    }
  }

  // 3️⃣ Aggregate behavior
  if (data.type === "behavior" || data.type === "click") {
    aggregate.scrollSum += data.scroll ?? 0
    aggregate.events++
    aggregate.clicks += data.clicks ? 1 : 0
    aggregate.ctaSeen += data.ctaSeen ?? 0
    aggregate.converted += data.converted ?? 0
    aggregate.dirty = true
  }

  // 3️⃣ Flush each 24h ONLY if dirty
  const ONE_DAY = 1000 * 60 * 60 * 24
  const now = Date.now()

  if (aggregate.dirty && now - aggregate.lastFlush > ONE_DAY) {
    await db.insert(behavior).values({
      scroll: aggregate.scrollSum / aggregate.events,
      time: aggregate.events,
      clicks: aggregate.clicks,
      ctaSeen: aggregate.ctaSeen,
      converted: aggregate.converted,
    })

    aggregate = {
      scrollSum: 0,
      events: 0,
      clicks: 0,
      ctaSeen: 0,
      converted: 0,
      lastFlush: now,
      dirty: false,
    }

    console.log("💾 Behavior guardado (24h flush)")
  }

  return Response.json({ ok: true })
}

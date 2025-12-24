import { NextRequest } from "next/server"

export const runtime = "edge" // 👈 IMPORTANTE PARA SSE EN VERCEL

let clients: ReadableStreamDefaultController[] = []

// 🔴 ADMIN SE CONECTA (SSE)
export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      clients.push(controller)

      controller.enqueue(
        `data: ${JSON.stringify({
          type: "connected",
          ts: Date.now(),
        })}\n\n`,
      )
    },
    cancel(controller) {
      clients = clients.filter((c) => c !== controller)
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}

// 🟢 LANDING ENVÍA EVENTOS
export async function POST(req: NextRequest) {
  const data = await req.json()

  // Get IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ||
             req.headers.get('x-real-ip') ||
             req.headers.get('cf-connecting-ip') ||
             'unknown'

  let country = '🌍'

  if (ip !== 'unknown') {
    try {
      const res = await fetch(`https://ipapi.co/${ip}/json/`, { cache: 'force-cache' })
      if (res.ok) {
        const geo = await res.json()
        country = geo.country_code ? `🇺${geo.country_code.slice(1).toLowerCase()}` : '🌍'
        // Wait, for US it's US, flag is 🇺🇸
        const flags: Record<string, string> = {
          US: '🇺🇸', CO: '🇨🇴', MX: '🇲🇽', ES: '🇪🇸', AR: '🇦🇷', BR: '🇧🇷', CA: '🇨🇦', FR: '🇫🇷', DE: '🇩🇪', IT: '🇮🇹'
        }
        country = flags[geo.country_code] || '🌍'
      }
    } catch {}
  }

  const payload = {
    ...data,
    country,
    ts: Date.now(),
  }

  // Broadcast a todos los admins conectados
  clients.forEach((client) => {
    try {
      client.enqueue(`data: ${JSON.stringify(payload)}\n\n`)
    } catch {}
  })

  return Response.json({ ok: true })
}

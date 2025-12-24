import { NextRequest } from "next/server";

// ⚠️ Requerido para SSE en Vercel
export const runtime = "edge";

// Lista de controladores de clientes SSE conectados
let clients: ReadableStreamDefaultController[] = [];

// 🔴 Endpoint para que el ADMIN se conecte (SSE)
export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      // Agregar cliente a la lista
      clients.push(controller);

      // Confirmar conexión
      controller.enqueue(
        `data: ${JSON.stringify({
          type: "connected",
          ts: Date.now(),
        })}\n\n`
      );
    },
    cancel(controller) {
      // Eliminar cliente cuando se cierra la conexión
      clients = clients.filter((c) => c !== controller);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Evita buffering en algunos proxies
    },
  });
}

// 🟢 Endpoint para que el LANDING envíe eventos (POST)
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Obtener país desde Cloudflare (gratis, sin llamadas externas)
    let country = req.headers.get("cf-ipcountry")?.trim() || "XX";

    // Mapeo de códigos de país a emojis de bandera
    const flags: Record<string, string> = {
      US: "🇺🇸",
      CO: "🇨🇴",
      MX: "🇲🇽",
      ES: "🇪🇸",
      AR: "🇦🇷",
      BR: "🇧🇷",
      CA: "🇨🇦",
      FR: "🇫🇷",
      DE: "🇩🇪",
      IT: "🇮🇹",
      GB: "🇬🇧",
      NL: "🇳🇱",
      AU: "🇦🇺",
      JP: "🇯🇵",
      KR: "🇰🇷",
      RU: "🇷🇺",
      IN: "🇮🇳",
      // Agrega más si lo necesitas
    };

    const flag = flags[country] || "🌍";

    // Construir payload final
    const payload = {
      ...data,
      country: flag,
      ts: Date.now(),
    };

    // Broadcast a todos los clientes SSE conectados
    for (const client of clients) {
      try {
        client.enqueue(`data: ${JSON.stringify(payload)}\n\n`);
      } catch (err) {
        // Cliente desconectado o inválido — lo eliminamos silenciosamente
        clients = clients.filter((c) => c !== client);
      }
    }

    return Response.json({ ok: true });
  } catch (error) {
    // Manejo básico de errores (log opcional en producción)
    return Response.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }
}
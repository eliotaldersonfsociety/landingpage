import { db } from "@/lib/db"
import { behavior } from "@/lib/schema"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    await db.insert(behavior).values({
      scroll: body.scroll ?? 0,
      time: body.time ?? 0,
      clicks: body.clicks ?? 0,
      ctaSeen: body.ctaSeen ?? 0,
      converted: body.converted ?? 0,
    })

    return new Response("ok", { status: 200 })
  } catch (error) {
    console.error("Error saving behavior data:", error)
    return new Response("Error", { status: 500 })
  }
}

export async function GET() {
  try {
    const data = await db.select().from(behavior)
    return new Response(JSON.stringify(data), { status: 200 })
  } catch (error) {
    console.error("Error fetching behavior data:", error)
    return new Response("Error", { status: 500 })
  }
}

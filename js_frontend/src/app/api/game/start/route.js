import { proxyBackendGameRequest } from "../_proxy"

export async function POST(request) {
  let body

  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const lives = Number(body?.lives)
  if (!Number.isInteger(lives) || lives <= 0) {
    return new Response(JSON.stringify({ error: "lives must be a positive integer" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    return await proxyBackendGameRequest("/game/start", { lives })
  } catch (error) {
    const details = error instanceof Error ? error.message : String(error)
    return new Response(JSON.stringify({ error: "Backend is unavailable", details }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    })
  }
}

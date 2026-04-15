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

  const move = typeof body?.move === "string" ? body.move.trim() : ""
  if (!move) {
    return new Response(JSON.stringify({ error: "move is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const userId = Number(body?.userId)
  if (!Number.isInteger(userId) || userId <= 0) {
    return new Response(JSON.stringify({ error: "userId is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    return await proxyBackendGameRequest("/game/move", { user_id: userId, move })
  } catch (error) {
    const details = error instanceof Error ? error.message : String(error)
    return new Response(JSON.stringify({ error: "Backend is unavailable", details }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    })
  }
}

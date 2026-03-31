const BACKEND_BASE_URL = process.env.GAME_BACKEND_URL || "http://127.0.0.1:8080"

export async function proxyBackendGameRequest(path, payload) {
  const response = await fetch(`${BACKEND_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  })

  const text = await response.text()
  const contentType = response.headers.get("content-type") || "application/json"

  return new Response(text, {
    status: response.status,
    headers: { "Content-Type": contentType },
  })
}

"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { allConstellations } from "../game/constellations-data"

const topRightButtonClass =
    "fixed top-7 right-8 z-50 text-right text-4xl uppercase tracking-[0.18em] text-zinc-300 transition-colors duration-200 hover:text-white hover:scale-105 md:top-12 md:right-14 md:text-5xl"

const topLeftUserClass =
    "fixed top-7 left-8 z-50 text-left text-4xl uppercase tracking-[0.18em] text-zinc-300 md:top-12 md:left-14 md:text-5xl"

const logoutButtonClass =
    "fixed bottom-7 left-8 z-50 text-left text-3xl uppercase tracking-[0.14em] text-zinc-500 transition-all duration-200 hover:text-red-400 hover:scale-105 md:bottom-12 md:left-14 md:text-4xl"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081"

function buildIdToNameMap() {
  // Must match C++ std::map ordering (lexicographic by UTF-8 bytes).
  // JS default .sort() compares by UTF-16 code units, which can differ from
  // UTF-8 byte order for characters across the D0/D1 boundary (e.g. Орёл vs Орион).
  // Use explicit byte-level comparison via TextEncoder to match C++ exactly.
  const encoder = new TextEncoder()
  const sorted = [...allConstellations].sort((a, b) => {
    const ba = encoder.encode(a)
    const bb = encoder.encode(b)
    const len = Math.min(ba.length, bb.length)
    for (let i = 0; i < len; i++) {
      if (ba[i] !== bb[i]) return ba[i] - bb[i]
    }
    return ba.length - bb.length
  })
  const map = {}
  sorted.forEach((name, idx) => { map[idx] = name })
  return map
}

const ID_TO_NAME = buildIdToNameMap()

function parseGameState(pathStr) {
  try {
    const state = JSON.parse(pathStr)
    if (state && typeof state === "object" && Array.isArray(state.path)) {
      const pathNames = state.path.map(id => ID_TO_NAME[id] || `#${id}`)
      const startName = ID_TO_NAME[state.start] || "—"
      const finishName = ID_TO_NAME[state.finish] || "—"
      return { pathNames, startName, finishName }
    }
  } catch {}
  return { pathNames: [], startName: "—", finishName: "—" }
}

function getResultFromGame(game) {
  if (!game.finished) return "abandoned"
  if (game.winner === "player") return "victory"
  if (game.winner === "model") return "defeat"
  return "abandoned"
}

function getResultText(result) {
  switch (result) {
    case "victory":
      return "Победа"
    case "defeat":
      return "Поражение"
    case "abandoned":
      return "Не завершена"
    default:
      return "Неизвестно"
  }
}

function getResultColor(result) {
  switch (result) {
    case "victory":
      return "text-green-400"
    case "defeat":
      return "text-red-400"
    default:
      return "text-zinc-500"
  }
}

function GameHistoryItem({ game, onClick }) {
  const { pathNames, startName, finishName } = parseGameState(game.path)
  const result = getResultFromGame(game)
  const resultText = getResultText(result)
  const resultColor = getResultColor(result)

  return (
      <button
          onClick={onClick}
          className="group w-full text-left transition-transform duration-200 hover:scale-[1.03] focus:outline-none"
      >
        <div className="flex flex-col gap-1 py-4 border-b border-foreground/10 overflow-hidden">
          <p className="text-4xl tracking-[0.08em] text-white transition-transform duration-200 group-hover:scale-[1.02] origin-left truncate min-w-0">
            {startName} → {finishName}
          </p>
          <div className="flex items-baseline gap-10 min-w-0">
            <p className={`text-3xl tracking-[0.08em] ${resultColor}`}>
              {resultText}
            </p>
            <p className="text-2xl tracking-[0.08em] text-zinc-600">
              {pathNames.length > 0 ? `${pathNames.length} ход.` : ""}
            </p>
          </div>
        </div>
      </button>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [gameHistory, setGameHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [error, setError] = useState(null)

  const fetchGames = useCallback(async () => {
    const token = localStorage.getItem('authToken')
    if (!token) return

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/games/recent`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      )

      if (response.status === 401) {
        localStorage.removeItem('authToken')
        localStorage.removeItem('username')
        localStorage.removeItem('userId')
        localStorage.removeItem('isLoggedIn')
        router.push('/login')
        return
      }

      if (!response.ok) throw new Error('Не удалось загрузить историю игр')

      const data = await response.json()
      const games = data.games || []

      setGameHistory(games)
      setError(null)
    } catch (err) {
      console.error('Error fetching game history:', err)
      setError(err.message)
    }
  }, [router])

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    const storedUsername = localStorage.getItem('username')

    if (!token || !storedUsername) {
      router.push('/login')
      return
    }

    setUsername(storedUsername)

    fetchGames().finally(() => setIsLoading(false))
  }, [router, fetchGames])

  const handleGameClick = (game) => {
    const { pathNames, startName, finishName } = parseGameState(game.path)
    const result = getResultFromGame(game)

    const params = new URLSearchParams({
      result: result === "victory" ? "won" : "lost",
      reason: getResultText(result),
      start: startName,
      target: finishName,
      path: JSON.stringify(pathNames),
      from: "profile",
    })
    router.push(`/result?${params.toString()}`)
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    const token = localStorage.getItem('authToken')

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        console.log('Logout successful on backend')
      } else {
        console.warn('Backend logout returned:', response.status)
      }
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      localStorage.removeItem('authToken')
      localStorage.removeItem('username')
      localStorage.removeItem('userId')
      localStorage.removeItem('isLoggedIn')
      router.push('/login')
    }
  }

  if (isLoading) {
    return (
        <main className="relative isolate h-screen bg-background flex items-center justify-center overflow-hidden">
          <img
              src="/background_v3.jpg"
              alt=""
              aria-hidden="true"
              className="pointer-events-none fixed inset-0 -z-20 h-full w-full object-cover"
          />
          <div className="pointer-events-none fixed inset-0 -z-10 bg-[#070b16]/65" />
          <p className="text-4xl tracking-[0.08em] text-zinc-400">Загрузка...</p>
        </main>
    )
  }

  return (
      <main className="relative isolate h-screen bg-background px-8 py-7 md:px-14 md:py-12 overflow-x-hidden overflow-y-auto">
        <img
            src="/background_v3.jpg"
            alt=""
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 -z-20 h-full w-full object-cover"
        />
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[#070b16]/65" />

        <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col">
          <div className="relative">
            <h1 className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap text-center text-6xl font-bold uppercase tracking-[0.22em] text-foreground md:text-7xl">
              История игр
            </h1>
            {gameHistory.length > 0 && (
              <Link href="/menu" className={topRightButtonClass}>
                К игре
              </Link>
            )}
            <div className={topLeftUserClass}>
              {username}
            </div>
          </div>

          <div className="mt-28 flex flex-1 flex-col md:mt-32">
            {error && gameHistory.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center">
                  <p className="text-4xl tracking-[0.08em] text-red-400">
                    {error}
                  </p>
                  <button
                      onClick={() => { setIsLoading(true); setError(null); fetchGames().finally(() => setIsLoading(false)) }}
                      className="mt-8 text-4xl uppercase tracking-[0.18em] text-foreground transition-all duration-200 hover:scale-105 hover:text-white"
                  >
                    Повторить
                  </button>
                </div>
            ) : gameHistory.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center">
                  <p className="text-4xl tracking-[0.08em] text-zinc-500">
                    История игр пуста
                  </p>
                  <Link
                      href="/menu"
                      className="mt-8 text-6xl uppercase tracking-[0.18em] text-foreground transition-all duration-200 hover:scale-105 hover:text-white"
                  >
                    Начать игру
                  </Link>
                </div>
            ) : (
                <div className="flex flex-col pb-20">
                  {gameHistory.map((game) => (
                      <GameHistoryItem
                          key={game.id}
                          game={game}
                          onClick={() => handleGameClick(game)}
                      />
                  ))}

                </div>
            )}
          </div>

          <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className={`${logoutButtonClass} ${isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoggingOut ? "Выход..." : "Выйти"}
          </button>
        </div>
      </main>
  )
}

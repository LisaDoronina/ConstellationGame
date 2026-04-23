"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
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
const PAGE_SIZE = 10

// The C++ backend stores constellation IDs as integers.
// nlohmann::json sorts object keys alphabetically (via std::map),
// so the ID assignment matches alphabetical sort of Russian names.
function buildIdToNameMap() {
  const sorted = [...allConstellations].sort((a, b) => a.localeCompare(b, "ru"))
  const map = {}
  sorted.forEach((name, idx) => { map[idx] = name })
  return map
}

const ID_TO_NAME = buildIdToNameMap()

// The DB "path" column stores the full serialized GameState JSON:
// {"start":42,"finish":17,"current_pos":5,"path":[42,5,12],...}
// We need to parse it and extract start, finish, and path (converting IDs to names).
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
          <div className="flex items-baseline gap-4 min-w-0">
            <p className="text-4xl tracking-[0.08em] text-white transition-transform duration-200 group-hover:scale-[1.02] origin-left truncate min-w-0">
              {startName} → {finishName}
            </p>
            <p className={`text-3xl tracking-[0.08em] ${resultColor} transition-transform duration-200 group-hover:scale-[1.02] shrink-0 ml-auto`}>
              {resultText}
            </p>
          </div>
          <p className="text-2xl tracking-[0.08em] text-zinc-600">
            {pathNames.length > 0 ? `${pathNames.length} ход.` : ""}
            {game.id ? ` #${game.id}` : ""}
          </p>
        </div>
      </button>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [gameHistory, setGameHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState(null)

  const fetchGames = useCallback(async (pageNum, append = false) => {
    const token = localStorage.getItem('authToken')
    if (!token) return

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/games?page=${pageNum}&size=${PAGE_SIZE}`,
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

      setGameHistory(prev => append ? [...prev, ...games] : games)
      setHasMore(games.length === PAGE_SIZE)
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

    fetchGames(0).finally(() => setIsLoading(false))
  }, [router, fetchGames])

  const handleLoadMore = async () => {
    const nextPage = page + 1
    setIsLoadingMore(true)
    await fetchGames(nextPage, true)
    setPage(nextPage)
    setIsLoadingMore(false)
  }

  const handleGameClick = (game) => {
    const { pathNames, startName, finishName } = parseGameState(game.path)
    const result = getResultFromGame(game)

    const params = new URLSearchParams({
      result: result === "victory" ? "won" : "lost",
      reason: getResultText(result),
      start: startName,
      target: finishName,
      path: JSON.stringify(pathNames),
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
            <Link href="/menu" className={topRightButtonClass}>
              К игре
            </Link>
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
                      onClick={() => { setIsLoading(true); setError(null); fetchGames(0).finally(() => setIsLoading(false)) }}
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
                      className="mt-8 text-4xl uppercase tracking-[0.18em] text-foreground transition-all duration-200 hover:scale-105 hover:text-white"
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
                  {hasMore && (
                      <button
                          onClick={handleLoadMore}
                          disabled={isLoadingMore}
                          className="mt-6 self-center text-3xl uppercase tracking-[0.14em] text-zinc-400 transition-all duration-200 hover:text-white hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoadingMore ? "Загрузка..." : "Загрузить ещё"}
                      </button>
                  )}
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

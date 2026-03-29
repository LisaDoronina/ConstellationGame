"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const topRightButtonClass =
  "fixed top-7 right-8 z-50 text-right text-4xl uppercase tracking-[0.18em] text-zinc-300 transition-colors duration-200 hover:text-white hover:scale-105 md:top-12 md:right-14 md:text-5xl"

const topLeftUserClass =
  "fixed top-7 left-8 z-50 text-left text-4xl uppercase tracking-[0.18em] text-zinc-300 md:top-12 md:left-14 md:text-5xl"

const logoutButtonClass =
  "fixed bottom-7 left-8 z-50 text-left text-3xl uppercase tracking-[0.14em] text-zinc-500 transition-all duration-200 hover:text-zinc-300 hover:scale-105 md:bottom-12 md:left-14 md:text-4xl"

// Заглушка для данных истории игр
// TODO: Заменить на реальные данные с бэкенда
const mockGameHistory = [
  {
    id: "game-1",
    startTime: "2025-03-28T14:30:00",
    difficulty: "Средний",
    result: "victory", // 'victory', 'defeat', 'abandoned'
    startConstellation: "Орион",
    targetConstellation: "Лира",
    path: ["Орион", "Телец", "Возничий", "Персей", "Андромеда", "Пегас", "Лебедь", "Лира"],
  },
  {
    id: "game-2",
    startTime: "2025-03-27T19:15:00",
    difficulty: "Легкий",
    result: "defeat",
    startConstellation: "Большая Медведица",
    targetConstellation: "Скорпион",
    path: ["Большая Медведица", "Малая Медведица", "Дракон", "Цефей"],
  },
  {
    id: "game-3",
    startTime: "2025-03-26T10:45:00",
    difficulty: "Сложный",
    result: "abandoned",
    startConstellation: "Кассиопея",
    targetConstellation: "Центавр",
    path: ["Кассиопея", "Персей", "Телец"],
  },
  {
    id: "game-4",
    startTime: "2025-03-25T21:00:00",
    difficulty: "Средний",
    result: "victory",
    startConstellation: "Лебедь",
    targetConstellation: "Орел",
    path: ["Лебедь", "Лисичка", "Стрела", "Орел"],
  },
  {
    id: "game-5",
    startTime: "2025-03-24T16:20:00",
    difficulty: "Легкий",
    result: "defeat",
    startConstellation: "Близнецы",
    targetConstellation: "Дева",
    path: ["Близнецы", "Рак", "Лев"],
  },
]

function formatDateTime(isoString) {
  const date = new Date(isoString)
  const day = date.getDate().toString().padStart(2, "0")
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const year = date.getFullYear()
  const hours = date.getHours().toString().padStart(2, "0")
  const minutes = date.getMinutes().toString().padStart(2, "0")
  
  return `${day}.${month}.${year} ${hours}:${minutes}`
}

function getResultText(result) {
  switch (result) {
    case "victory":
      return "Победа"
    case "defeat":
      return "Поражение"
    case "abandoned":
      return "Преждевременное завершение"
    default:
      return "Неизвестно"
  }
}

function GameHistoryItem({ game, onClick }) {
  const resultText = getResultText(game.result)
  
  return (
    <button
      onClick={onClick}
      className="group w-full text-left transition-transform duration-200 hover:scale-[1.03] focus:outline-none"
    >
      <div className="flex flex-col gap-1 py-4 border-b border-foreground/10">
        <p className="text-4xl tracking-[0.08em] text-white transition-transform duration-200 group-hover:scale-[1.02] origin-left">
          {formatDateTime(game.startTime)}
        </p>
        <p className="text-3xl tracking-[0.08em] text-zinc-500 transition-transform duration-200 group-hover:scale-[1.02] origin-left">
          {game.difficulty} / {resultText}
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

  useEffect(() => {
    // Проверка авторизации
    const isLoggedIn = localStorage.getItem('isLoggedIn')
    const storedUsername = localStorage.getItem('username')
    
    if (!isLoggedIn || !storedUsername) {
      router.push('/login')
      return
    }
    
    setUsername(storedUsername)
    
    // TODO: Заглушка для бэкенда - заменить на реальный API вызов
    // Пример: const response = await fetch('/api/user/game-history', {
    //   headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
    // })
    // const data = await response.json()
    // setGameHistory(data.games)
    
    // Используем заглушку
    setTimeout(() => {
      setGameHistory(mockGameHistory)
      setIsLoading(false)
    }, 300)
  }, [router])

  const handleGameClick = (game) => {
    // Формируем URL для страницы результатов с данными игры
    const params = new URLSearchParams({
      result: game.result === "victory" ? "won" : "lost",
      reason: getResultText(game.result),
      start: game.startConstellation,
      target: game.targetConstellation,
      path: JSON.stringify(game.path),
    })
    router.push(`/result?${params.toString()}`)
  }

  const handleLogout = () => {
    // TODO: Вызвать API для выхода
    // await fetch('/api/auth/logout', { method: 'POST' })
    
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('username')
    localStorage.removeItem('authToken')
    
    router.push('/')
  }

  if (isLoading) {
    return (
      <main className="relative isolate min-h-screen bg-background flex items-center justify-center">
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
    <main className="relative isolate min-h-screen bg-background px-8 py-7 md:px-14 md:py-12">
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
          <Link href="/" className={topRightButtonClass}>
            К игре
          </Link>
          <div className={topLeftUserClass}>
            {username}
          </div>
        </div>

        <div className="mt-28 flex flex-1 flex-col md:mt-32">
          {gameHistory.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center">
              <p className="text-4xl tracking-[0.08em] text-zinc-500">
                История игр пуста
              </p>
              <Link
                href="/"
                className="mt-8 text-4xl uppercase tracking-[0.18em] text-foreground transition-all duration-200 hover:scale-105 hover:text-white"
              >
                Начать игру
              </Link>
            </div>
          ) : (
            <div className="flex flex-col">
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
          className={logoutButtonClass}
        >
          Выйти
        </button>
      </div>
    </main>
  )
}

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

const rulesButtonClass =
  "text-right text-4xl uppercase tracking-[0.18em] text-zinc-300 transition-colors duration-200 hover:text-white md:text-5xl"

const topLeftUserClass =
  "text-left text-4xl text-zinc-300 md:text-5xl"

const actionButtonClass =
  "pointer-events-auto whitespace-nowrap text-right text-5xl uppercase tracking-[0.18em] text-foreground transition-all duration-200 hover:scale-105 hover:text-white md:text-6xl"

function ResultContent() {
  const searchParams = useSearchParams()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState("")

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true'
    const storedUsername = localStorage.getItem('username')
    setIsLoggedIn(loggedIn)
    if (storedUsername) {
      setUsername(storedUsername)
    }
  }, [])

  const result = searchParams.get("result") || "lost"
  const reason = searchParams.get("reason") || "Неизвестная причина"
  const start = searchParams.get("start") || "—"
  const target = searchParams.get("target") || "—"
  const rawPath = searchParams.get("path")
  const from = searchParams.get("from")
  const backHref = from === "profile" ? "/profile" : "/menu"

  let path = []
  try {
    path = rawPath ? JSON.parse(rawPath) : []
  } catch {
    path = []
  }

  const imageUrl =
    path.length > 0 ? `/api/path-image?path=${encodeURIComponent(JSON.stringify(path))}&target=${encodeURIComponent(target)}` : null

  return (
    <main className="relative isolate min-h-screen w-full bg-background px-8 py-7 md:px-14 md:py-12 overflow-x-hidden">
        <img
                src="/background_v3.jpg"
                alt=""
                aria-hidden="true"
                className="pointer-events-none fixed inset-0 -z-20 h-full w-full object-cover"
         />
      <div className="w-full pointer-events-none fixed inset-0 -z-10 bg-[#070b16]/65" />
        <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl flex-col">
          <div className="relative flex items-start justify-between">
            <Link href={isLoggedIn ? "/profile" : "/login"} className={`${topLeftUserClass} uppercase tracking-[0.18em] transition-all duration-200 hover:text-white hover:scale-105`}>
              {isLoggedIn ? username : "Вход"}
            </Link>
            <h1 className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 text-center whitespace-nowrap text-6xl font-bold uppercase tracking-[0.2em] text-foreground">
              {result === "won" ? "Победа" : "Поражение"}
            </h1>
            <Link href={backHref} className={rulesButtonClass}>
              Назад
            </Link>
          </div>

        <div className="mt-28 flex justify-between gap-8">
          <div className="text-left">
            <p className="text-5xl font-bold tracking-[0.08em] text-white">Старт</p>
            <p className="ml-12 text-5xl tracking-[0.08em] text-zinc-400">{start}</p>
          </div>

          <div className="text-right">
            <p className="text-5xl font-bold tracking-[0.08em] text-white">Финиш</p>
            <p className="ml-12 text-5xl tracking-[0.08em] text-zinc-400">{target}</p>
          </div>
        </div>

        <div className="mt-10 flex flex-1 flex-col items-center justify-center gap-8">
          {imageUrl ? (
            <div className="flex w-full max-w-5xl items-center justify-center overflow-hidden border border-foreground/20 bg-foreground/5">
              <img src={imageUrl} alt="Маршрут партии" className="h-auto w-full object-contain" />
            </div>
          ) : (
            <div className="flex min-h-[28rem] w-full max-w-5xl items-center justify-center border border-foreground/20 bg-foreground/5">
              <p className="text-5xl tracking-[0.08em] text-zinc-500">Изображение маршрута недоступно</p>
            </div>
          )}

          <div className="w-full max-w-5xl">
            <p className="text-4xl tracking-[0.08em] text-zinc-400">
              {path.length > 0 ? path.join(" → ") : reason}
            </p>
          </div>
        </div>


      </div>
          <div className="mt-10 pb-7 flex justify-end px-16 md:px-28">
            <Link
              href="/menu"
              className={actionButtonClass}
            >
              На главную
            </Link>
          </div>
    </main>
  )
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-4xl tracking-[0.08em] text-zinc-400">Загрузка...</p>
        </main>
      }
    >
      <ResultContent />
    </Suspense>
  )
}



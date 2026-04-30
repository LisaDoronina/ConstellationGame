"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

const backButtonClass =
  "pointer-events-auto origin-right text-right text-4xl uppercase tracking-[0.18em] text-zinc-300 transition-all duration-200 hover:text-white hover:scale-105 md:text-5xl"

const topLeftUserClass =
  "pointer-events-auto origin-left text-left text-4xl text-zinc-300 uppercase tracking-[0.18em] transition-all duration-200 hover:text-white hover:scale-105 md:text-5xl"

const topRightButtonClass =
  "pointer-events-auto origin-right text-right text-4xl uppercase tracking-[0.18em] text-zinc-300 transition-all duration-200 hover:text-white hover:scale-105 md:text-5xl"

const actionButtonClass =
  "pointer-events-auto origin-right whitespace-nowrap text-right text-5xl uppercase tracking-[0.18em] text-foreground transition-all duration-200 hover:scale-105 hover:text-white md:text-6xl"

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
    <main className="relative isolate min-h-screen bg-background">
        <img
          src="/background_v3.jpg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-20 h-full w-full object-cover"
        />
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[#070b16]/65" />

        <div className="relative mx-auto flex min-h-screen w-full flex-col px-16 py-12">
          <div className="relative flex items-start justify-center">
            <Link href={isLoggedIn ? "/profile" : "/login"} className={`absolute left-0 ${topLeftUserClass}`}>
              {isLoggedIn ? username : "Вход"}
            </Link>
            <div className="pointer-events-none whitespace-nowrap text-center text-6xl font-bold uppercase tracking-[0.22em] text-foreground md:text-7xl">
              {result === "won" ? "Победа" : "Поражение"}
            </div>
            {from === "profile" ? (
              <Link href={backHref} className={`absolute right-0 ${backButtonClass}`}>
                Назад
              </Link>
            ) : (
              <Link href="/rules?returnTo=/result" className={`absolute right-0 ${topRightButtonClass}`}>
                Правила
              </Link>
            )}
          </div>

        <div className="mt-20 mx-auto flex w-full max-w-6xl justify-between gap-8 md:mt-14">
          <div className="text-left">
            <p className="text-5xl font-bold tracking-[0.08em] text-white">Старт</p>
            <p className="ml-14 text-5xl tracking-[0.08em] text-zinc-400">{start}</p>
          </div>

          <div className="text-right [&>p]:origin-right">
            <p className="mr-14 text-5xl tracking-[0.08em] text-zinc-400">{target}</p>
            <p className="text-5xl font-bold tracking-[0.08em] text-white">Финиш</p>

          </div>
        </div>

        <div className="mt-10 flex flex-1 flex-col items-center gap-8 pb-24">
          {imageUrl ? (
            <div className="flex w-full max-w-6xl items-center justify-center overflow-hidden border border-foreground/20 bg-foreground/5">
              <img src={imageUrl} alt="Маршрут партии" className="h-auto w-full object-contain" />
            </div>
          ) : (
            <div className="flex min-h-[28rem] w-full max-w-6xl items-center justify-center border border-foreground/20 bg-foreground/5">
              <p className="text-5xl tracking-[0.08em] text-zinc-500">Изображение маршрута недоступно</p>
            </div>
          )}

          <div className="w-full max-w-6xl">
            <p className="text-4xl tracking-[0.08em] text-zinc-400">
              {path.length > 0 ? path.join(" → ") : reason}
            </p>
          </div>

        </div>
          <Link href="/menu" className={`absolute bottom-12 right-14 ${actionButtonClass}`}>
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



"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function ResultContent() {
  const searchParams = useSearchParams()
  const result = searchParams.get("result") || "lost"
  const reason = searchParams.get("reason") || "Неизвестная причина"
  const start = searchParams.get("start") || "—"
  const target = searchParams.get("target") || "—"
  const rawPath = searchParams.get("path")
  let path = []

  try {
    path = rawPath ? JSON.parse(rawPath) : []
  } catch {
    path = []
  }

  const isWon = result === "won"
  const imageUrl =
    path.length > 0 ? `/api/path-image?path=${encodeURIComponent(JSON.stringify(path))}` : null

  return (
    <main className="min-h-screen bg-background px-8 py-8 md:px-14 md:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col">
        <div className="mt-2 flex items-end justify-between gap-8">
          <div className="translate-y-1 text-4xl text-zinc-300 md:text-5xl">*User*</div>

          <h1 className="translate-y-1 whitespace-nowrap text-center text-6xl uppercase tracking-[0.22em] text-foreground md:text-7xl">
            {isWon ? "Победа" : "Поражение"}
          </h1>

          <Link
            href="/"
            className="translate-y-1 text-right text-4xl uppercase tracking-[0.18em] text-zinc-300 transition-all duration-200 hover:scale-110 hover:text-white md:text-5xl"
          >
            Назад
          </Link>
        </div>

        <div className="mt-16 grid flex-1 gap-12 md:mt-20 md:grid-cols-[1fr_1.1fr] md:gap-20">
          <section>
            <h2 className="mb-4 whitespace-nowrap text-5xl font-bold uppercase tracking-[0.18em] text-foreground">
              Путь
            </h2>
            <div className="mb-8 h-px w-full bg-foreground/20" />

            <div className="grid grid-cols-[auto_1fr] items-baseline gap-4">
              <p className="whitespace-nowrap text-4xl tracking-[0.08em] text-white">Старт</p>
              <p className="text-4xl tracking-[0.08em] text-zinc-400">{start}</p>
            </div>

            <div className="mt-6 grid grid-cols-[auto_1fr] items-baseline gap-4">
              <p className="whitespace-nowrap text-4xl tracking-[0.08em] text-white">Финиш</p>
              <p className="text-4xl tracking-[0.08em] text-zinc-400">{target}</p>
            </div>

            <div className="mt-8">
              <p className="mb-3 whitespace-nowrap text-4xl tracking-[0.08em] text-white">Маршрут партии</p>
              <p className="text-4xl tracking-[0.08em] text-zinc-400">
                {path.length > 0 ? path.join(" → ") : "Маршрут пока недоступен"}
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-4 whitespace-nowrap text-5xl font-bold uppercase tracking-[0.18em] text-foreground">
              Итог
            </h2>
            <div className="mb-8 h-px w-full bg-foreground/20" />
            <p className="max-w-4xl text-4xl tracking-[0.08em] text-zinc-400">{reason}</p>

            <div className="mt-10">
              <p className="mb-4 whitespace-nowrap text-4xl tracking-[0.08em] text-white">Будущая картинка</p>
              {imageUrl ? (
                <div className="overflow-hidden border border-foreground/20 bg-foreground/5">
                  <img
                    src={imageUrl}
                    alt="Маршрут партии"
                    className="h-auto w-full object-contain"
                  />
                </div>
              ) : (
                <div className="flex min-h-64 items-center justify-center border border-foreground/20 bg-foreground/5">
                  <p className="text-4xl tracking-[0.08em] text-zinc-500">Заглушка под изображение</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="pointer-events-none fixed bottom-8 right-8 md:bottom-10 md:right-14">
          <Link
            href="/"
            className="pointer-events-auto origin-right whitespace-nowrap text-5xl uppercase tracking-[0.18em] text-foreground transition-all duration-200 hover:scale-110 hover:text-white md:text-6xl"
          >
            На главную
          </Link>
        </div>
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

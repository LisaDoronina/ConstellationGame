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

  const isWon = result === "won"

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
      {/* Start and Target - bigger */}
      <div className="w-full max-w-3xl flex justify-between items-start mb-12">
        <div className="text-left">
          <p className="text-base uppercase tracking-widest text-muted-foreground mb-2">Старт</p>
          <p className="text-3xl md:text-4xl font-display text-foreground tracking-wide">{start}</p>
        </div>
        <div className="text-right">
          <p className="text-base uppercase tracking-widest text-muted-foreground mb-2">Финиш</p>
          <p className="text-3xl md:text-4xl font-display text-foreground tracking-wide">{target}</p>
        </div>
      </div>

      {/* Result */}
      <div className="text-center mb-8">
        <h1 className="text-5xl md:text-6xl font-display tracking-widest text-foreground mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
          {isWon ? "ПОБЕДА" : "ПОРАЖЕНИЕ"}
        </h1>
        <div className="w-24 h-px bg-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground text-lg tracking-wide">{reason}</p>
      </div>

      {/* Star map placeholder */}
      <div className="w-full max-w-xl aspect-video border border-foreground/20 flex items-center justify-center mb-12 relative overflow-hidden">
        {/* Starry background effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-background to-muted/20">
          {/* Decorative stars - fixed positions to avoid hydration mismatch */}
          {[
            { top: 10, left: 15, opacity: 0.4 },
            { top: 25, left: 80, opacity: 0.6 },
            { top: 40, left: 30, opacity: 0.3 },
            { top: 55, left: 65, opacity: 0.5 },
            { top: 70, left: 20, opacity: 0.7 },
            { top: 85, left: 75, opacity: 0.4 },
            { top: 15, left: 50, opacity: 0.5 },
            { top: 35, left: 90, opacity: 0.3 },
            { top: 60, left: 45, opacity: 0.6 },
            { top: 80, left: 55, opacity: 0.4 },
            { top: 20, left: 35, opacity: 0.5 },
            { top: 45, left: 10, opacity: 0.7 },
            { top: 65, left: 85, opacity: 0.3 },
            { top: 90, left: 40, opacity: 0.5 },
            { top: 30, left: 70, opacity: 0.4 },
            { top: 50, left: 25, opacity: 0.6 },
            { top: 75, left: 60, opacity: 0.3 },
            { top: 5, left: 95, opacity: 0.5 },
            { top: 95, left: 5, opacity: 0.4 },
            { top: 48, left: 52, opacity: 0.6 },
          ].map((star, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-foreground/40 rounded-full"
              style={{
                top: `${star.top}%`,
                left: `${star.left}%`,
                opacity: star.opacity,
              }}
            />
          ))}
        </div>
        <p className="text-muted-foreground text-sm uppercase tracking-widest z-10">
          Визуализация маршрута
        </p>
      </div>

      {/* Divider */}
      <div className="w-32 h-px bg-foreground/20 mb-8" />

      {/* Single action - На главную */}
      <Link
        href="/"
        className="text-3xl md:text-4xl font-display tracking-widest text-foreground hover:text-foreground/80 transition-all duration-200 uppercase"
      >
        На главную
      </Link>
    </main>
  )
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-muted-foreground">Загрузка...</p>
        </main>
      }
    >
      <ResultContent />
    </Suspense>
  )
}

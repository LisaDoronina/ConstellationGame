"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function RulesContent() {
  const searchParams = useSearchParams()
  const returnTo = searchParams.get("returnTo")

  return (
    <main className="min-h-screen bg-background px-8 py-8 md:px-14 md:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col">
        <div className="mt-2 flex items-end justify-between gap-8">
          <div className="translate-y-1 text-4xl text-zinc-300 md:text-5xl">*User*</div>

          <h1 className="translate-y-1 whitespace-nowrap text-center text-6xl uppercase tracking-[0.22em] text-foreground md:text-7xl">
            Правила
          </h1>

          <Link
            href={returnTo || "/"}
            className="translate-y-1 text-right text-4xl uppercase tracking-[0.18em] text-zinc-300 transition-all duration-200 hover:scale-110 hover:text-white md:text-5xl"
          >
            Назад
          </Link>
        </div>

        <div className="mt-16 flex flex-1 flex-col gap-10 md:mt-20">
          <section>
            <h2 className="mb-4 whitespace-nowrap text-5xl font-bold uppercase tracking-[0.18em] text-foreground">
              Цель игры
            </h2>
            <div className="mb-6 h-px w-full bg-foreground/20" />
            <p className="max-w-5xl text-4xl tracking-[0.08em] text-zinc-400">
              Дойти от начального созвездия до конечного, перемещаясь только по соседним созвездиям.
              Побеждает тот, кто первым достигает финиша.
            </p>
          </section>

          <section>
            <h2 className="mb-4 whitespace-nowrap text-5xl font-bold uppercase tracking-[0.18em] text-foreground">
              Ход игры
            </h2>
            <div className="mb-6 h-px w-full bg-foreground/20" />
            <p className="max-w-5xl text-4xl tracking-[0.08em] text-zinc-400">
              Вы и ИИ по очереди называете созвездия. Ход должен вести в соседнее созвездие.
            </p>
          </section>

          <section>
            <h2 className="mb-4 whitespace-nowrap text-5xl font-bold uppercase tracking-[0.18em] text-foreground">
              Ошибки
            </h2>
            <div className="mb-6 h-px w-full bg-foreground/20" />
            <p className="max-w-5xl text-4xl tracking-[0.08em] text-zinc-400">
              Неверный ход, уже использованное или несуществующее созвездие отнимает одну жизнь.
            </p>
          </section>

          <section>
            <h2 className="mb-4 whitespace-nowrap text-5xl font-bold uppercase tracking-[0.18em] text-foreground">
              Победа и поражение
            </h2>
            <div className="mb-6 h-px w-full bg-foreground/20" />
            <p className="max-w-5xl text-4xl tracking-[0.08em] text-zinc-400">
              Игра завершается, когда кто-то достигает финишного созвездия, когда заканчиваются жизни
              или когда больше нет допустимых ходов.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}

export default function RulesPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-4xl tracking-[0.08em] text-zinc-400">Загрузка...</p>
        </main>
      }
    >
      <RulesContent />
    </Suspense>
  )
}

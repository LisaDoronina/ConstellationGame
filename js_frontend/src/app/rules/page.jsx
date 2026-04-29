"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

const topRightButtonClass =
    "fixed top-12 right-16 z-50 origin-right text-right text-4xl uppercase tracking-[0.18em] text-zinc-300 transition-all duration-200 hover:text-white hover:scale-105 md:text-5xl"

const topLeftUserClass =
    "fixed top-12 left-16 z-50 text-left text-4xl uppercase tracking-[0.18em] text-zinc-300 transition-all duration-200 hover:text-white hover:scale-105 md:text-5xl"

function RulesContent() {
  const searchParams = useSearchParams()
  const returnTo = searchParams.get("returnTo")
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

  return (
      <main className="relative isolate h-screen bg-background">
        <img
            src="/background_v3.jpg"
            alt=""
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 -z-20 h-full w-full object-cover"
        />
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[#070b16]/65" />
        <div className="mx-auto flex h-full w-full flex-col px-8 py-7 md:px-14 md:py-12">
          <div className="pointer-events-none text-center whitespace-nowrap text-6xl font-bold uppercase tracking-[0.22em] text-foreground md:text-7xl">
            Правила
          </div>
          <Link
              href={returnTo || "/menu"}
              className={topRightButtonClass}
          >
            Назад
          </Link>


        <div className="mt-16 flex flex-1 flex-col gap-10 md:mt-20 py-15 md:px-12">
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




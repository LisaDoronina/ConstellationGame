"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function RulesContent() {
  const searchParams = useSearchParams()
  const returnTo = searchParams.get("returnTo")

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8 relative">
      {/* Back button - top right with padding */}
      <Link
        href={returnTo || "/"}
        className="fixed top-6 right-8 text-2xl font-display text-muted-foreground hover:text-foreground transition-all duration-200 uppercase tracking-widest z-50"
      >
        Назад
      </Link>

      <header className="text-center mb-10">
        <h1 className="text-5xl md:text-6xl font-display tracking-widest text-foreground mb-4 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
          ПРАВИЛА
        </h1>
        <div className="w-12 h-px bg-foreground/30 mx-auto" />
      </header>

      <div className="max-w-xl text-center space-y-6">
        <section>
          <h2 className="text-2xl font-display tracking-wide text-foreground mb-2 uppercase">
            Цель игры
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed tracking-wide">
            Дойти от начального созвездия до конечного, перемещаясь только по соседним созвездиям.
            Побеждает тот, кто первым достигнет финишного созвездия.
          </p>
        </section>

        <div className="w-16 h-px bg-foreground/20 mx-auto" />

        <section>
          <h2 className="text-2xl font-display tracking-wide text-foreground mb-2 uppercase">
            Ход игры
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed tracking-wide">
            Вы и ИИ по очереди называете созвездия. Каждое названное созвездие должно быть
            соседним с текущим и ещё не использованным в этой партии.
          </p>
        </section>

        <div className="w-16 h-px bg-foreground/20 mx-auto" />

        <section>
          <h2 className="text-2xl font-display tracking-wide text-foreground mb-2 uppercase">
            Ошибки
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed tracking-wide">
            При неверном ходе (несоседнее созвездие, уже использованное или несуществующее)
            вы теряете одну жизнь. Когда жизни заканчиваются — игра проиграна.
          </p>
        </section>

        <div className="w-16 h-px bg-foreground/20 mx-auto" />

        <section>
          <h2 className="text-2xl font-display tracking-wide text-foreground mb-2 uppercase">
            Победа и поражение
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed tracking-wide">
            Игра завершается, когда кто-то достигает конечного созвездия, у одной из сторон
            не остаётся допустимых ходов, или когда вы решите завершить игру досрочно.
          </p>
        </section>
      </div>
    </main>
  )
}

export default function RulesPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Загрузка...</p>
      </main>
    }>
      <RulesContent />
    </Suspense>
  )
}

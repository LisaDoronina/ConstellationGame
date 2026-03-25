"use client"

import { useState } from "react"
import Link from "next/link"

const presetModes = [
  { id: "easy", label: "Легкий", description: "5 жизней, подсказки." },
  { id: "normal", label: "Средний", description: "3 жизни, подсказки" },
  { id: "hard", label: "Сложный", description: "1 жизнь." },
]

const difficultyChoices = [
  { id: "easy", label: "да" },
  { id: "medium", label: "нет" },
]

const inputMethodChoices = [
  { id: "type", label: "вручную" },
  { id: "select", label: "из списка" },
]

export default function HomePage() {
  const [selectedMode, setSelectedMode] = useState("normal")
  const [customSettings, setCustomSettings] = useState({
    lives: 3,
    difficulty: "medium",
    inputMethod: "type",
  })

  const getGameSettings = () => {
    if (selectedMode === "custom") {
      return { ...customSettings }
    }

    const presets = {
      easy: { lives: 5, difficulty: "easy", inputMethod: "type" },
      normal: { lives: 3, difficulty: "medium", inputMethod: "type" },
      hard: { lives: 1, difficulty: "hard", inputMethod: "type" },
    }

    return presets[selectedMode]
  }

  const settings = getGameSettings()
  const gameUrl = `/game?lives=${settings.lives}&difficulty=${settings.difficulty}&inputMethod=${settings.inputMethod}`
  const isCustom = selectedMode === "custom"

  const setCustom = (patch) => {
    setSelectedMode("custom")
    setCustomSettings((prev) => ({ ...prev, ...patch }))
  }

  const optionClass = (isSelected) =>
    `origin-left whitespace-nowrap uppercase tracking-[0.08em] text-zinc-400 transition-all duration-200 hover:scale-110 hover:text-zinc-200 ${
      isSelected ? "text-zinc-300 underline decoration-2 underline-offset-8" : ""
    }`

  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-8 py-8 md:px-14 md:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col">
        <div className="mt-2 flex items-end justify-between gap-8">
          <div className="translate-y-1 text-4xl text-zinc-300 md:text-5xl">
            *User*
          </div>

          <h1 className="translate-y-1 whitespace-nowrap text-center text-6xl uppercase tracking-[0.22em] text-foreground md:text-7xl">
            Созвездия
          </h1>

          <Link
            href="/rules"
            className="translate-y-1 text-right text-4xl uppercase tracking-[0.18em] text-zinc-300 transition-all duration-200 hover:scale-110 hover:text-white md:text-5xl"
          >
            Правила
          </Link>
        </div>

        <div className="mt-16 grid flex-1 gap-14 md:mt-20 md:grid-cols-[1fr_1.08fr] md:gap-20">
          <section>
            <h2 className="mb-4 whitespace-nowrap text-5xl font-bold uppercase tracking-[0.18em] text-foreground">
              Режим игры
            </h2>
            <div className="mb-8 h-px w-full bg-foreground/20" />

            <div className="flex flex-col gap-8">
              {presetModes.map((mode) => {
                const isSelected = selectedMode === mode.id

                return (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id)}
                    className="grid grid-cols-[2rem_auto_1fr] items-baseline gap-4 text-left"
                  >
                    <span
                      className={`origin-center text-3xl text-zinc-300 transition-all duration-200 ${
                        isSelected ? "rotate-[-90deg] opacity-100" : "opacity-0"
                      }`}
                    >
                      √
                    </span>
                    <span
                      className={`origin-left whitespace-nowrap uppercase tracking-[0.14em] text-white transition-all duration-200 hover:scale-110 hover:text-zinc-100 ${
                        isSelected
                          ? "scale-110 text-foreground text-5xl font-bold"
                          : "text-4xl font-bold"
                      }`}
                    >
                      {mode.label}
                    </span>
                    <span className="text-4xl tracking-[0.08em] text-zinc-500">
                      {mode.description}
                    </span>
                  </button>
                )
              })}
            </div>
          </section>

          <section>
            <button onClick={() => setSelectedMode("custom")} className="mb-4 text-left text-white">
              <span className="whitespace-nowrap text-5xl font-bold uppercase tracking-[0.18em]">
                Индивидуальная настройка
              </span>
            </button>
            <div className="mb-8 h-px w-full bg-foreground/20" />

            <div className="flex flex-col gap-8">
              <div className="grid grid-cols-[auto_1fr] items-baseline gap-4">
                <p className="whitespace-nowrap text-4xl tracking-[0.08em] text-white">Жизни</p>
                <div className="flex flex-wrap gap-8">
                  {[1, 3, 5].map((num) => (
                    <button
                      key={num}
                      onClick={() => setCustom({ lives: num })}
                      className={`text-4xl ${optionClass(isCustom && customSettings.lives === num)}`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-[auto_1fr] items-baseline gap-4">
                <p className="whitespace-nowrap text-4xl tracking-[0.08em] text-white">Способ ввода</p>
                <div className="flex flex-wrap gap-8">
                  {inputMethodChoices.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setCustom({ inputMethod: method.id })}
                      className={`text-4xl ${optionClass(isCustom && customSettings.inputMethod === method.id)}`}
                    >
                      {method.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-[auto_1fr] items-baseline gap-4">
                <p className="whitespace-nowrap text-4xl tracking-[0.08em] text-white">Подсказки</p>
                <div className="flex flex-wrap gap-8">
                  {difficultyChoices.map((diff) => (
                    <button
                      key={diff.id}
                      onClick={() => setCustom({ difficulty: diff.id })}
                      className={`text-4xl ${optionClass(isCustom && customSettings.difficulty === diff.id)}`}
                    >
                      {diff.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="pointer-events-none fixed bottom-8 right-8 md:bottom-10 md:right-14">
          <Link
            href={gameUrl}
            className="pointer-events-auto origin-right whitespace-nowrap text-5xl uppercase tracking-[0.18em] text-foreground transition-all duration-200 hover:scale-110 hover:text-white md:text-6xl"
          >
            Начать
          </Link>
        </div>
      </div>
    </main>
  )
}

"use client"

import { useState } from "react"
import Link from "next/link"

const presetModes = [
  { id: "easy", label: "Легкий", description: "5 жизней, подсказки." },
  { id: "normal", label: "Средний", description: "3 жизни, подсказки" },
  { id: "hard", label: "Сложный", description: "1 жизнь, нет подсказок" },
]

const difficultyChoices = [
  { id: "easy", label: "да" },
  { id: "medium", label: "нет" },
]

const inputMethodChoices = [
  { id: "type", label: "вручную" },
  { id: "select", label: "из списка" },
]

const actionButtonClass =
  "pointer-events-auto z-50 whitespace-nowrap text-right text-5xl uppercase tracking-[0.18em] text-foreground transition-all duration-200 hover:scale-105 hover:text-white md:text-6xl"

const rulesButtonClass =
  "absolute top-0 z-50 text-right right-0 text-4xl uppercase tracking-[0.18em] text-zinc-300 transition-all duration-200 hover:text-white hover:scale-105 md:text-5xl"

const userButtonClass =
  "absolute top-0 z-50 text-left left-0 text-4xl uppercase tracking-[0.18em] text-zinc-300 transition-all duration-200 hover:text-white hover:scale-105 md:text-5xl"

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

  const modeClass = (isSelected) =>
    `origin-left whitespace-nowrap uppercase leading-none tracking-[0.14em] text-white transition-colors duration-200 hover:text-zinc-100 ${
      isSelected ? "text-5xl font-normal" : "text-4xl font-normal"
    }`

  const optionClass = (isSelected) =>
    `origin-left whitespace-nowrap uppercase tracking-[0.08em] transition-all duration-200 hover:scale-110 hover:text-zinc-200 ${
      isSelected ? "text-white underline decoration-2 underline-offset-8" : "text-zinc-500"
    }`

  return (
    <main className="relative h-screen overflow-hidden bg-background">
      <img
        src="/menu-stars.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-20 h-full w-full rotate-90 scale-[1.8] object-cover opacity-70"
      />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[#070b16]/65" />
      {/*   Начинается главная часть страницы */}
      <div className="mx-auto flex h-full w-full flex-col px-8 py-7 md:px-14 md:py-12">
        <div className="relative">
          <div className="pointer-events-none absolute inset-x-0 top-0 text-center whitespace-nowrap text-6xl font-bold uppercase tracking-[0.22em] text-foreground md:text-7xl">
            Созвездия
          </div>
          <Link href="/rules" className={rulesButtonClass}>
            Правила
          </Link>
          <div className={userButtonClass}>
              User
          </div>
        </div>

        <div className="grid py-10 flex-1 gap-14 md:mt-24 md:grid-cols-[0.92fr_1.08fr] md:gap-12">
          <section className="pr-0">
            <h2 className="mb-5 whitespace-nowrap text-5xl font-bold uppercase tracking-[0.1em] text-foreground">
              Режим игры
            </h2>
            <div className="mb-8 h-px w-full bg-foreground/20" />

            <div className="flex flex-col gap-10">
              {presetModes.map((mode) => {
                const isSelected = selectedMode === mode.id

                return (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id)}
                    className="flex flex-col items-start gap-2 text-left"
                  >
                    <span className={modeClass(isSelected)}>{mode.label}</span>
                    <span className="ml-6 whitespace-nowrap text-3xl leading-none tracking-[0.08em] text-zinc-500">
                      {mode.description}
                    </span>
                  </button>
                )
              })}
            </div>
          </section>

          <section className="pl-2">
            <div className="mb-5 whitespace-nowrap text-5xl font-bold uppercase tracking-[0.18em] text-white">
              Индивидуальная настройка
            </div>
            <div className="mb-8 h-px w-full bg-foreground/20" />

            <div className="flex flex-col gap-10">
              <div className="grid grid-cols-[auto_1fr] items-baseline gap-3">
                <p className="whitespace-nowrap text-5xl leading-none tracking-[0.08em] text-white">Жизни</p>
                <div className="flex flex-wrap justify-center gap-10">
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

              <div className="grid grid-cols-[auto_1fr] items-baseline gap-3">
                <p className="whitespace-nowrap text-5xl leading-none tracking-[0.08em] text-white">Способ ввода</p>
                <div className="flex flex-wrap justify-center gap-10">
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

              <div className="grid grid-cols-[auto_1fr] items-baseline gap-3">
                <p className="whitespace-nowrap text-5xl leading-none tracking-[0.08em] text-white">Подсказки</p>
                <div className="flex flex-wrap justify-center gap-10">
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

        <div className="pointer-events-none fixed bottom-10 right-14">
          <Link href={gameUrl} className={actionButtonClass}>
            Начать
          </Link>
        </div>

      </div>
    </main>
  )
}






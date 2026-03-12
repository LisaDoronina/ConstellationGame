"use client"

import { useState } from "react"
import Link from "next/link"

export default function HomePage() {
  const [selectedMode, setSelectedMode] = useState("normal")
  const [customSettings, setCustomSettings] = useState({
    lives: 3,
    difficulty: "medium",
    inputMethod: "type",
  })

  const presetModes = [
    { id: "easy", label: "Лёгкий", description: "Модель играет просто" },
    { id: "normal", label: "Обычный", description: "Модель играет средне" },
    { id: "hard", label: "Сложный", description: "Модель играет на максимуме" },
  ]

  const getGameSettings = () => {
    if (selectedMode === "custom") {
      return {
        lives: customSettings.lives,
        difficulty: customSettings.difficulty,
        inputMethod: customSettings.inputMethod,
      }
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

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
      {/* Rules button - top right with padding */}
      <Link
        href="/rules"
        className="fixed top-6 right-8 text-2xl font-display text-muted-foreground hover:text-foreground transition-all duration-200 uppercase tracking-widest z-50"
      >
        Правила
      </Link>

      {/* Header */}
      <header className="text-center mb-12">
        <h1 className="text-5xl md:text-7xl font-display tracking-widest text-foreground mb-4 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
          СОЗВЕЗДИЯ
        </h1>
        <div className="w-20 h-px bg-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground text-lg tracking-wide">
          Путешествие по звёздному небу
        </p>
      </header>

      {/* Mode Selection */}
      <div className="w-full max-w-3xl flex flex-col md:flex-row gap-8 md:gap-12 mb-12">
        {/* Left: Preset Modes */}
        <div className="flex-1">
          <h2 className="text-base uppercase tracking-widest text-muted-foreground mb-4">
            Режим игры
          </h2>
          <div className="w-full h-px bg-foreground/20 mb-4" />
          
          <div className="flex flex-col gap-3">
            {presetModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className={`text-left py-2 transition-all duration-200 group ${
                  selectedMode === mode.id
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="text-2xl md:text-3xl font-display tracking-wide uppercase">
                  {selectedMode === mode.id && "> "}
                  {mode.label}
                </span>
                <p className="text-base text-muted-foreground mt-1 tracking-wide">
                  {mode.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Custom Settings */}
        <div className="flex-1">
          <button
            onClick={() => setSelectedMode("custom")}
            className={`text-left py-2 transition-all duration-200 mb-2 w-full ${
              selectedMode === "custom"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="text-base uppercase tracking-widest">
              {selectedMode === "custom" && "> "}
              Индивидуальная настройка
            </span>
          </button>
          <div className="w-full h-px bg-foreground/20 mb-4" />

          {/* Lives Selection */}
          <div className="mb-4">
            <p className="text-base text-muted-foreground mb-2 uppercase tracking-widest">
              Жизни
            </p>
            <div className="flex gap-2">
              {[1, 3, 5].map((num) => (
                <button
                  key={num}
                  onClick={() => {
                    setSelectedMode("custom")
                    setCustomSettings((prev) => ({ ...prev, lives: num }))
                  }}
                  className={`px-5 py-2 text-2xl font-display transition-all duration-200 tracking-wide ${
                    selectedMode === "custom" && customSettings.lives === num
                      ? "text-foreground border-b-2 border-foreground"
                      : "text-muted-foreground hover:text-foreground border-b-2 border-transparent"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Selection */}
          <div className="mb-4">
            <p className="text-base text-muted-foreground mb-2 uppercase tracking-widest">
              Мастерство модели
            </p>
            <div className="flex gap-2">
              {[
                { id: "easy", label: "Легко" },
                { id: "medium", label: "Средне" },
                { id: "hard", label: "Сложно" },
              ].map((diff) => (
                <button
                  key={diff.id}
                  onClick={() => {
                    setSelectedMode("custom")
                    setCustomSettings((prev) => ({ ...prev, difficulty: diff.id }))
                  }}
                  className={`px-4 py-2 text-xl font-display transition-all duration-200 tracking-wide ${
                    selectedMode === "custom" && customSettings.difficulty === diff.id
                      ? "text-foreground border-b-2 border-foreground"
                      : "text-muted-foreground hover:text-foreground border-b-2 border-transparent"
                  }`}
                >
                  {diff.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input Method Selection */}
          <div>
            <p className="text-base text-muted-foreground mb-2 uppercase tracking-widest">
              Способ ввода
            </p>
            <div className="flex gap-2">
              {[
                { id: "type", label: "Вручную" },
                { id: "select", label: "Из списка" },
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => {
                    setSelectedMode("custom")
                    setCustomSettings((prev) => ({ ...prev, inputMethod: method.id }))
                  }}
                  className={`px-4 py-2 text-xl font-display transition-all duration-200 tracking-wide ${
                    selectedMode === "custom" && customSettings.inputMethod === method.id
                      ? "text-foreground border-b-2 border-foreground"
                      : "text-muted-foreground hover:text-foreground border-b-2 border-transparent"
                  }`}
                >
                  {method.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="w-48 h-px bg-foreground/20 mb-10" />

      {/* Start Button */}
      <Link
        href={gameUrl}
        className="text-3xl md:text-5xl font-display tracking-widest text-foreground hover:text-foreground/80 transition-all duration-200 uppercase"
      >
        Начать игру
      </Link>
    </main>
  )
}

"use client"

import { useState, useEffect, useCallback, useRef, Suspense, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { allConstellations } from "./constellations-data"

const topRightButtonClass =
  "fixed top-7 right-8 z-50 text-right text-4xl uppercase tracking-[0.18em] text-zinc-300 transition-colors duration-200 hover:text-white md:top-12 md:right-14 md:text-5xl"

const topLeftUserClass =
  "fixed top-7 left-8 z-50 text-left text-4xl text-zinc-300 md:top-12 md:left-14 md:text-5xl"

const bottomRightActionClass =
  "fixed bottom-7 right-8 z-50 whitespace-nowrap text-right text-5xl uppercase tracking-[0.18em] text-foreground transition-all duration-200 hover:scale-105 hover:text-white md:bottom-12 md:right-14 md:text-6xl"

function asArray(value) {
  if (Array.isArray(value)) return value
  if (value == null) return []
  return [value]
}

function normalizeGameState(rawState, { initialLives, difficulty, inputMethod, previousState = null }) {
  if (!rawState || typeof rawState !== "object") return null

  const startConstellation =
    rawState.startConstellation ??
    rawState.start_constellation ??
    rawState.start ??
    previousState?.startConstellation

  const targetConstellation =
    rawState.targetConstellation ??
    rawState.target_constellation ??
    rawState.finish ??
    rawState.target ??
    previousState?.targetConstellation

  const currentConstellation =
    rawState.currentConstellation ??
    rawState.current_constellation ??
    rawState.current ??
    previousState?.currentConstellation ??
    startConstellation

  if (!startConstellation || !targetConstellation || !currentConstellation) {
    return null
  }

  const rawUsed =
    rawState.usedConstellations ??
    rawState.used_constellations ??
    rawState.used ??
    rawState.path ??
    previousState?.usedConstellations ??
    []

  const usedConstellations = rawUsed instanceof Set ? rawUsed : new Set(asArray(rawUsed))
  usedConstellations.add(startConstellation)
  usedConstellations.add(currentConstellation)

  const movesFromState = Array.isArray(rawState.moves) ? rawState.moves : previousState?.moves ?? []
  const moves =
    movesFromState.length > 0
      ? movesFromState
      : asArray(rawState.path)
          .slice(1)
          .map((constellation) => ({ player: "unknown", constellation }))

  const lives = Number(
    rawState.lives ??
      rawState.player_lives ??
      rawState.remainingLives ??
      previousState?.lives ??
      initialLives
  )
  const maxLives = Number(rawState.maxLives ?? rawState.max_lives ?? previousState?.maxLives ?? initialLives)

  const gameStatus =
    rawState.gameStatus ??
    rawState.status ??
    rawState.result ??
    (rawState.game_over
      ? currentConstellation === targetConstellation || Number(rawState.model_lives) <= 0
        ? "won"
        : "lost"
      : null) ??
    previousState?.gameStatus ??
    "playing"

  const endReason =
    rawState.endReason ??
    rawState.reason ??
    (rawState.game_over
      ? currentConstellation === targetConstellation
        ? "Вы достигли конечного созвездия"
        : Number(rawState.player_lives) <= 0
        ? "Закончились жизни"
        : Number(rawState.model_lives) <= 0
        ? "У ИИ закончились жизни"
        : "Игра завершена"
      : "") ??
    previousState?.endReason ??
    ""

  return {
    startConstellation,
    targetConstellation,
    currentConstellation,
    usedConstellations,
    lives: Number.isFinite(lives) ? lives : initialLives,
    maxLives: Number.isFinite(maxLives) ? maxLives : initialLives,
    isPlayerTurn:
      typeof rawState.isPlayerTurn === "boolean"
        ? rawState.isPlayerTurn
        : typeof rawState.player_turn === "boolean"
        ? rawState.player_turn
        : gameStatus === "playing",
    gameStatus,
    endReason,
    moves,
    difficulty: rawState.difficulty ?? previousState?.difficulty ?? difficulty,
    inputMethod: rawState.inputMethod ?? previousState?.inputMethod ?? inputMethod,
    availableMoves: asArray(
      rawState.availableMoves ??
        rawState.available_moves ??
        rawState.validMoves ??
        rawState.neighborMoves ??
        rawState.neighbors ??
        []
    ),
  }
}

async function readResponsePayload(response) {
  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return { error: text }
  }
}

// Grid-based constellation background - avoids overlapping and excluded zones
function ConstellationBackground({
  usedConstellations,
  onSelect,
  isPlayerTurn,
  showUsed,
}) {
  const gridPositions = useMemo(() => {
    const positions = []
    const cols = 8
    const rows = 11

    const isExcluded = (col, row) => {
      if (row <= 1 && col >= 6) return true
      if (row >= 9 && col <= 2) return true
      if (row >= 9 && col >= 5) return true
      if (row >= 2 && row <= 8 && col >= 2 && col <= 5) return true
      return false
    }

    const seed = 54321
    const random = (i) => {
      const x = Math.sin(seed + i * 7777) * 10000
      return x - Math.floor(x)
    }

    let idx = 0
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (!isExcluded(col, row) && idx < allConstellations.length) {
          positions.push({
            col,
            row,
            rotation: (random(idx) > 0.5 ? 1 : -1) * (10 + random(idx + 100) * 30),
          })
          idx++
        }
      }
    }

    while (positions.length < allConstellations.length) {
      const i = positions.length
      positions.push({
        col: i % cols,
        row: Math.floor(i / cols),
        rotation: (random(i) > 0.5 ? 1 : -1) * (10 + random(i + 100) * 30),
      })
    }

    return positions
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 p-4">
      <div className="relative w-full h-full">
        {allConstellations.map((name, i) => {
          const isUsed = usedConstellations.has(name)
          const pos = gridPositions[i]
          const left = `${(pos.col / 7) * 90 + 5}%`
          const top = `${(pos.row / 10) * 90 + 5}%`

          return (
            <button
              key={name}
              onClick={() => {
                if (isPlayerTurn && !isUsed) {
                  onSelect(name)
                }
              }}
              disabled={!isPlayerTurn || isUsed}
              className={`absolute text-base md:text-lg font-bold transition-all duration-300 pointer-events-auto whitespace-nowrap tracking-[0.1em] ${
                isUsed && showUsed
                  ? "text-amber-500/50"
                  : isUsed
                  ? "text-muted-foreground/20"
                  : "text-muted-foreground/30 hover:text-muted-foreground/60 cursor-pointer"
              }`}
              style={{
                left,
                top,
                transform: `rotate(${pos.rotation}deg)`,
              }}
            >
              {name}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function GameContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inputRef = useRef(null)

  const lives = parseInt(searchParams.get("lives") || "3")
  const difficulty = searchParams.get("difficulty") || "medium"
  const inputMethod = searchParams.get("inputMethod") || "type"

  const [input, setInput] = useState("")
  const [feedback, setFeedback] = useState(null)
  const [gameState, setGameState] = useState(null)
  const [autocomplete, setAutocomplete] = useState(null)
  const [checkResult, setCheckResult] = useState(null)
  const [requestError, setRequestError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState("")
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true"
    const storedUsername = localStorage.getItem("username")
    const storedUserId = localStorage.getItem("userId")
    setIsLoggedIn(loggedIn)
    if (storedUsername) {
      setUsername(storedUsername)
    }
    if (storedUserId) {
      const parsedUserId = Number(storedUserId)
      if (Number.isInteger(parsedUserId) && parsedUserId > 0) {
        setUserId(parsedUserId)
      }
    }
  }, [])

  const startGame = useCallback(async () => {
    setRequestError("")
    setGameState(null)

    if (!Number.isInteger(userId) || userId <= 0) {
      setRequestError("Нужно войти в аккаунт перед началом игры")
      return
    }

    try {
      const response = await fetch("api/game/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, lives }),
      })

      const payload = await readResponsePayload(response)

      if (!response.ok) {
        setRequestError(payload?.error || "Не удалось начать игру")
        return
      }

      const nextState = normalizeGameState(payload, {
        initialLives: lives,
        difficulty,
        inputMethod,
      })

      if (!nextState) {
        setRequestError("Бэкенд вернул неполное состояние игры")
        return
      }

      setGameState(nextState)
    } catch {
      setRequestError("Бэкенд недоступен")
    }
  }, [userId, lives, difficulty, inputMethod])

  useEffect(() => {
    startGame()
  }, [startGame])

  useEffect(() => {
    if (!input.trim() || !gameState) {
      setAutocomplete(null)
      return
    }

    const inputLower = input.toLowerCase()
    const matches = allConstellations.filter((c) => c.toLowerCase().startsWith(inputLower))

    if (matches.length === 1 && matches[0].toLowerCase() !== inputLower) {
      setAutocomplete(matches[0])
    } else {
      setAutocomplete(null)
    }
  }, [input, gameState])

  const handleKeyDown = (e) => {
    if (e.key === "Tab" && autocomplete) {
      e.preventDefault()
      setInput(autocomplete)
      setAutocomplete(null)
    }
  }

  const showFeedback = useCallback((type) => {
    setFeedback(type)
    setTimeout(() => setFeedback(null), 400)
  }, [])

  const checkIfUsed = useCallback(() => {
    if (!gameState || !input.trim()) {
      setCheckResult(null)
      return
    }

    const guess = input.trim()
    if (gameState.usedConstellations.has(guess)) {
      setCheckResult("used")
    } else {
      setCheckResult("unused")
    }

    setTimeout(() => setCheckResult(null), 2000)
  }, [gameState, input])

  const submitMove = useCallback(
    async (guess) => {
      if (!gameState || !gameState.isPlayerTurn || gameState.gameStatus !== "playing" || !guess || isSubmitting) {
        return
      }

      setInput("")
      setAutocomplete(null)
      setRequestError("")
      setIsSubmitting(true)

      try {
        const response = await fetch("api/game/move", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, move: guess }),
        })

        const payload = await readResponsePayload(response)
        const nextState = normalizeGameState(payload, {
          initialLives: lives,
          difficulty,
          inputMethod,
          previousState: gameState,
        })

        if (nextState) {
          setGameState(nextState)
        }

        if (!response.ok) {
          setRequestError(payload?.error || "Ход отклонен")
          showFeedback("error")
          return
        }

        showFeedback("success")
      } catch {
        setRequestError("Не удалось отправить ход")
        showFeedback("error")
      } finally {
        setIsSubmitting(false)
      }
    },
    [difficulty, gameState, inputMethod, isSubmitting, lives, showFeedback, userId]
  )

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault()
      submitMove(input.trim())
    },
    [input, submitMove]
  )

  const handleSelectConstellation = useCallback((name) => {
    setInput(name)
  }, [])

  const handleEndGame = useCallback(() => {
    if (gameState) {
      setGameState((prev) => prev ? {
        ...prev,
        gameStatus: "lost",
        endReason: "Игра завершена досрочно",
      } : null)
    }
  }, [gameState])

  useEffect(() => {
    if (gameState?.gameStatus !== "playing" && gameState?.gameStatus) {
      const timeout = setTimeout(() => {
        const path = [gameState.startConstellation, ...gameState.moves.map((move) => move.constellation)]

        const params = new URLSearchParams({
          result: gameState.gameStatus,
          reason: gameState.endReason,
          start: gameState.startConstellation,
          target: gameState.targetConstellation,
          path: JSON.stringify(path),
        })
        router.push(`/result?${params.toString()}`)
      }, 1500)
      return () => clearTimeout(timeout)
    }
  }, [gameState, router])

  if (!gameState) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-2xl tracking-[0.15em]">Загрузка...</p>
      </main>
    )
  }

  const neighborMoves = gameState.availableMoves || []
  const showNeighbors = gameState.difficulty === "easy"
  const showSelectBackground = inputMethod === "select"

  const gameParams = `lives=${lives}&difficulty=${difficulty}&inputMethod=${inputMethod}`
  const returnUrl = `/game?${gameParams}`

  return (
    <main
      className={`relative isolate min-h-screen bg-background flex flex-col items-center justify-center px-8 py-7 transition-colors duration-300 md:px-14 md:py-12 ${
        feedback === "success" ? "bg-green-950/30" : feedback === "error" ? "bg-red-950/30" : ""
      }`}
    >
      <img
        src="/background_v3.jpg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-20 h-full w-full object-cover"
      />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[#070b16]/65" />
      {showSelectBackground && (
        <ConstellationBackground
          usedConstellations={gameState.usedConstellations}
          onSelect={handleSelectConstellation}
          isPlayerTurn={gameState.isPlayerTurn}
          showUsed={true}
        />
      )}

      <Link href={`/rules?returnTo=${encodeURIComponent(returnUrl)}`} className={topRightButtonClass}>
        Правила
      </Link>

      <Link
        href={isLoggedIn ? "/profile" : "/login"}
        className={`${topLeftUserClass} uppercase tracking-[0.18em] transition-all duration-200 hover:text-white hover:scale-105`}
      >
        {isLoggedIn ? username : "Вход"}
      </Link>

      <div className="relative z-10 mt-20 flex w-full max-w-6xl justify-between gap-8 md:mt-24">
        <div className="flex flex-col gap-1 text-left">
          <p className="text-5xl font-bold tracking-[0.08em] text-white">Старт</p>
          <p className="text-5xl tracking-[0.08em] text-zinc-300">{gameState.startConstellation}</p>
        </div>
        <div className="flex flex-col gap-1 text-right">
          <p className="text-5xl font-bold tracking-[0.08em] text-white">Финиш</p>
          <p className="text-5xl tracking-[0.08em] text-zinc-300">{gameState.targetConstellation}</p>
        </div>
      </div>

      <div className="relative z-10 mb-6 flex flex-col gap-1 text-center">
        <p className="text-5xl tracking-[0.08em] text-white md:text-6xl text-bold ">
          Текущее созвездие
        </p>
        <p className="text-5xl md:text-6xl font-bold text-foreground tracking-[0.12em] drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
          {gameState.currentConstellation}
        </p>
      </div>

      <div className="w-24 h-px bg-foreground/20 mb-6 relative z-10" />

      <p className="text-4xl text-zinc-300 mb-4 relative z-10 tracking-[0.1em]">
        {gameState.isPlayerTurn ? "Ваш ход" : "Ход ИИ..."}
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-xl mb-4 relative z-10">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Введите созвездие..."
            disabled={!gameState.isPlayerTurn || gameState.gameStatus !== "playing"}
            className="relative z-10 w-full bg-transparent border-b-2 border-foreground/30 text-foreground text-left text-4xl py-2 tracking-[0.08em] placeholder:text-zinc-600 focus:outline-none focus:border-foreground transition-colors disabled:opacity-50"
          />
          {autocomplete && autocomplete.toLowerCase() !== input.toLowerCase() && (
            <div className="absolute inset-0 flex items-center pointer-events-none">
              <span className="text-4xl text-zinc-500 tracking-[0.08em]">
                <span className="invisible">{input}</span>
                <span>{autocomplete.slice(input.length)}</span>
              </span>
            </div>
          )}
        </div>
        {autocomplete && <p className="text-2xl text-zinc-500 mt-2 text-left tracking-[0.08em]">Tab для автодополнения</p>}
      </form>

      {requestError && <p className="text-2xl mb-3 text-red-400 relative z-10 tracking-[0.08em]">{requestError}</p>}

      <button
        onClick={checkIfUsed}
        disabled={!input.trim()}
        className={`text-4xl mb-6 transition-colors duration-200 relative z-10 tracking-[0.08em] ${
          checkResult === "used" ? "text-amber-500" : "text-zinc-400 hover:text-zinc-300 disabled:opacity-30"
        }`}
      >
        {checkResult === "used" ? "Уже названо" : checkResult === "unused" ? "Ещё не названо" : "Проверить"}
      </button>

      {showNeighbors && (
        <div className="mb-8 text-center relative z-10">
          <p className="mb-2 text-2xl tracking-[0.12em] text-zinc-300">Доступные соседи</p>
          <div className="flex flex-wrap justify-center gap-2">
            {neighborMoves.map((move) => (
              <button
                key={move}
                onClick={() => setInput(move)}
                className={`text-xl transition-colors tracking-[0.1em] ${
                  gameState.usedConstellations.has(move)
                    ? "text-amber-500/70 hover:text-amber-500"
                    : "text-foreground/70 hover:text-foreground"
                }`}
              >
                {move}
              </button>
            ))}
            {neighborMoves.length === 0 && (
              <p className="text-lg text-muted-foreground tracking-[0.1em]">Нет доступных ходов</p>
            )}
          </div>
        </div>
      )}

      {gameState.difficulty === "hard" && (
        <div className="mb-8 text-center relative z-10">
          <p className="text-lg text-muted-foreground/60 tracking-[0.15em]">
            ИИ играет с максимальной точностью
          </p>
        </div>
      )}

      <div className="fixed bottom-7 left-8 z-50 flex flex-col items-start md:bottom-12 md:left-14">
        <p className="text-base text-muted-foreground/60 mb-1 uppercase tracking-[0.15em]">
          Жизни
        </p>
        <div className="flex gap-2">
          {Array.from({ length: gameState.maxLives }).map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full transition-all duration-200 ${
                i < gameState.lives ? "bg-foreground" : "bg-foreground/20"
              }`}
            />
          ))}
        </div>
      </div>

      {/* End game button - bottom right with padding */}
      <button
        onClick={handleEndGame}
        className={bottomRightActionClass}
      >
        Завершить
      </button>
    </main>
  )
}

export default function GamePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-muted-foreground text-2xl tracking-[0.15em]">Загрузка...</p>
        </main>
      }
    >
      <GameContent />
    </Suspense>
  )
}


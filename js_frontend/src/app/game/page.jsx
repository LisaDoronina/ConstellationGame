"use client"

import { useState, useEffect, useCallback, useRef, Suspense, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { allConstellations, constellations } from "./constellations-data"

const allConstellationNames = allConstellations

const topRightButtonClass =
  "fixed top-8 right-14 z-50 text-right text-4xl uppercase tracking-[0.18em] text-zinc-300 transition-colors duration-200 hover:text-white md:text-5xl"

const bottomRightActionClass =
  "fixed bottom-10 right-14 z-50 whitespace-nowrap text-right text-5xl uppercase tracking-[0.18em] text-foreground transition-all duration-200 hover:scale-110 hover:text-white md:text-6xl"

function getRandomConstellation() {
  return allConstellationNames[Math.floor(Math.random() * allConstellationNames.length)]
}

function getTargetConstellation(start) {
  let target = getRandomConstellation()
  while (target === start) {
    target = getRandomConstellation()
  }
  return target
}

// Grid-based constellation background - avoids overlapping and excluded zones
function ConstellationBackground({ 
  usedConstellations, 
  onSelect, 
  isPlayerTurn,
  showUsed
}) {
  const gridPositions = useMemo(() => {
    // Create a grid layout that avoids center and corners
    // Excluded zones: top-left (lives), top-right (rules), bottom-left (lives label), 
    // bottom-right (end button), center (main UI)
    
    const positions = []
    const cols = 8 // 8 columns
    const rows = 11 // 11 rows to fit all 88 constellations
    
    // Zones to avoid (in grid coordinates)
    // Top bar: row 0-1, col 0-1 and col 6-7
    // Bottom bar: row 9-10, col 0-2 and col 5-7
    // Center: row 3-7, col 2-5
    
    const isExcluded = (col, row) => {
      // Top left corner (rules area)
      if (row <= 1 && col >= 6) return true
      // Bottom left (lives)
      if (row >= 9 && col <= 2) return true
      // Bottom right (end button)
      if (row >= 9 && col >= 5) return true
      // Center area (main UI)
      if (row >= 2 && row <= 8 && col >= 2 && col <= 5) return true
      return false
    }
    
    // Seed-based pseudo-random for consistent positions
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
    
    // If we still have constellations left, fill remaining spots
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
          
          // Calculate position based on grid
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

  // Initialize game
  useEffect(() => {
    const start = getRandomConstellation()
    const target = getTargetConstellation(start)
    setGameState({
      startConstellation: start,
      targetConstellation: target,
      currentConstellation: start,
      usedConstellations: new Set([start]),
      lives: lives,
      maxLives: lives,
      isPlayerTurn: true,
      gameStatus: "playing",
      endReason: "",
      moves: [],
      difficulty: difficulty,
      inputMethod: inputMethod,
    })
  }, [lives, difficulty, inputMethod])

  // Autocomplete logic - works for any constellation
  useEffect(() => {
    if (!input.trim() || !gameState) {
      setAutocomplete(null)
      return
    }
    
    const inputLower = input.toLowerCase()
    const matches = allConstellations.filter(c => 
      c.toLowerCase().startsWith(inputLower)
    )
    
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

  const getValidMoves = useCallback((current, used) => {
    const neighbors = constellations[current] || []
    return neighbors.filter((n) => !used.has(n))
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

  const makeAIMove = useCallback((state) => {
    setTimeout(() => {
      const validMoves = getValidMoves(state.currentConstellation, state.usedConstellations)
      
      if (validMoves.length === 0) {
        setGameState((prev) => prev ? {
          ...prev,
          gameStatus: "won",
          endReason: "У ИИ закончились допустимые ходы",
        } : null)
        return
      }

      let aiMove

      if (state.difficulty === "easy") {
        // Easy: random choice
        aiMove = validMoves[Math.floor(Math.random() * validMoves.length)]
      } else if (state.difficulty === "hard") {
        // Hard: try to reach target or block player
        const moveToTarget = validMoves.find(m => m === state.targetConstellation)
        if (moveToTarget) {
          aiMove = moveToTarget
        } else {
          // Choose move that leads closer to target or limits player options
          aiMove = validMoves.reduce((best, move) => {
            const newUsed = new Set(state.usedConstellations)
            newUsed.add(move)
            const playerOptions = getValidMoves(move, newUsed).length
            const bestUsed = new Set(state.usedConstellations)
            bestUsed.add(best)
            const bestOptions = getValidMoves(best, bestUsed).length
            return playerOptions < bestOptions ? move : best
          }, validMoves[0])
        }
      } else {
        // Medium: 50/50 smart vs random
        if (Math.random() > 0.5) {
          const moveToTarget = validMoves.find(m => m === state.targetConstellation)
          aiMove = moveToTarget || validMoves[Math.floor(Math.random() * validMoves.length)]
        } else {
          aiMove = validMoves[Math.floor(Math.random() * validMoves.length)]
        }
      }

      const newUsed = new Set(state.usedConstellations)
      newUsed.add(aiMove)

      if (aiMove === state.targetConstellation) {
        setGameState((prev) => prev ? {
          ...prev,
          currentConstellation: aiMove,
          usedConstellations: newUsed,
          moves: [...prev.moves, { player: "ai", constellation: aiMove }],
          gameStatus: "lost",
          endReason: "ИИ достиг конечного созвездия",
        } : null)
      } else {
        setGameState((prev) => prev ? {
          ...prev,
          currentConstellation: aiMove,
          usedConstellations: newUsed,
          moves: [...prev.moves, { player: "ai", constellation: aiMove }],
          isPlayerTurn: true,
        } : null)
      }
    }, 1000)
  }, [getValidMoves])

  const submitMove = useCallback((guess) => {
    if (!gameState || !gameState.isPlayerTurn || gameState.gameStatus !== "playing") return

    setInput("")
    setAutocomplete(null)

    if (!constellations[guess]) {
      showFeedback("error")
      const newLives = gameState.lives - 1
      if (newLives <= 0) {
        setGameState((prev) => prev ? {
          ...prev,
          lives: 0,
          gameStatus: "lost",
          endReason: "Закончились жизни",
        } : null)
      } else {
        setGameState((prev) => prev ? { ...prev, lives: newLives } : null)
      }
      return
    }

    if (gameState.usedConstellations.has(guess)) {
      showFeedback("error")
      const newLives = gameState.lives - 1
      if (newLives <= 0) {
        setGameState((prev) => prev ? {
          ...prev,
          lives: 0,
          gameStatus: "lost",
          endReason: "Закончились жизни",
        } : null)
      } else {
        setGameState((prev) => prev ? { ...prev, lives: newLives } : null)
      }
      return
    }

    const neighbors = constellations[gameState.currentConstellation] || []
    if (!neighbors.includes(guess)) {
      showFeedback("error")
      const newLives = gameState.lives - 1
      if (newLives <= 0) {
        setGameState((prev) => prev ? {
          ...prev,
          lives: 0,
          gameStatus: "lost",
          endReason: "Закончились жизни",
        } : null)
      } else {
        setGameState((prev) => prev ? { ...prev, lives: newLives } : null)
      }
      return
    }

    showFeedback("success")
    const newUsed = new Set(gameState.usedConstellations)
    newUsed.add(guess)

    if (guess === gameState.targetConstellation) {
      setGameState((prev) => prev ? {
        ...prev,
        currentConstellation: guess,
        usedConstellations: newUsed,
        moves: [...prev.moves, { player: "user", constellation: guess }],
        gameStatus: "won",
        endReason: "Вы достигли конечного созвездия",
      } : null)
    } else {
      const newState = {
        ...gameState,
        currentConstellation: guess,
        usedConstellations: newUsed,
        moves: [...gameState.moves, { player: "user", constellation: guess }],
        isPlayerTurn: false,
      }
      setGameState(newState)
      makeAIMove(newState)
    }
  }, [gameState, showFeedback, makeAIMove])

  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    submitMove(input.trim())
  }, [input, submitMove])

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
        const path = [
          gameState.startConstellation,
          ...gameState.moves.map((move) => move.constellation),
        ]

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

  const validMoves = getValidMoves(gameState.currentConstellation, gameState.usedConstellations)
  const neighborMoves = constellations[gameState.currentConstellation] || []
  const showNeighbors = gameState.difficulty === "easy"
  const showSelectBackground = inputMethod === "select"

  // Build return URL preserving game state
  const gameParams = `lives=${lives}&difficulty=${difficulty}&inputMethod=${inputMethod}`
  const returnUrl = `/game?${gameParams}`

  return (
    <main
      className={`relative isolate min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8 transition-colors duration-300 ${
        feedback === "success"
          ? "bg-green-950/30"
          : feedback === "error"
          ? "bg-red-950/30"
          : ""
      }`}
    >
    <img
            src="/background_v3.jpg"
            alt=""
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 -z-20 h-full w-full object-cover"
          />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[#070b16]/65" />
      {/* Constellation background for select mode */}
      {showSelectBackground && (
        <ConstellationBackground
          usedConstellations={gameState.usedConstellations}
          onSelect={handleSelectConstellation}
          isPlayerTurn={gameState.isPlayerTurn}
          showUsed={true}
        />
      )}

      {/* Rules button - top right with padding */}
      <Link
        href={`/rules?returnTo=${encodeURIComponent(returnUrl)}`}
        className={topRightButtonClass}
      >
        Правила
      </Link>

      {/* Header with start and target - at edges and bigger */}
      <div className="mt-14 flex w-full max-w-6xl justify-between gap-8 relative z-10">
        <div className="text-left">
          <p className="text-5xl font-bold tracking-[0.08em] text-white">Старт</p>
          <p className="text-5xl tracking-[0.08em] text-zinc-300">{gameState.startConstellation}</p>
        </div>
        <div className="text-right">
          <p className="text-5xl font-bold tracking-[0.08em] text-white">Финиш</p>
          <p className="text-5xl tracking-[0.08em] text-zinc-300">{gameState.targetConstellation}</p>
        </div>
      </div>

      {/* Current constellation */}
      <div className="text-center mb-6 relative z-10">
        <p className="text-5xl tracking-[0.08em] text-white mb-3 md:text-6xl">
          Текущее созвездие
        </p>
        <p className="text-5xl md:text-6xl font-bold text-foreground tracking-[0.12em] drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
          {gameState.currentConstellation}
        </p>
      </div>

      {/* Divider */}
      <div className="w-24 h-px bg-foreground/20 mb-6 relative z-10" />

      {/* Turn indicator */}
      <p className="text-4xl text-zinc-300 mb-4 relative z-10 tracking-[0.1em]">
        {gameState.isPlayerTurn ? "Ваш ход" : "Ход ИИ..."}
      </p>

      {/* Input with autocomplete */}
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
        {autocomplete && (
          <p className="text-2xl text-zinc-500 mt-2 text-left tracking-[0.08em]">
            Tab для автодополнения
          </p>
        )}
      </form>

      {/* Check if used button */}
      <button
        onClick={checkIfUsed}
        disabled={!input.trim()}
        className={`text-4xl mb-6 transition-colors duration-200 relative z-10 tracking-[0.08em] ${
          checkResult === "used"
            ? "text-amber-500"
            : "text-zinc-400 hover:text-zinc-300 disabled:opacity-30"
        }`}
      >
        {checkResult === "used" ? "Уже названо" : checkResult === "unused" ? "Ещё не названо" : "Проверить"}
      </button>

      {/* Hints - available neighbors (only on easy) */}
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

      {/* Hard mode indicator */}
      {gameState.difficulty === "hard" && (
        <div className="mb-8 text-center relative z-10">
          <p className="text-lg text-muted-foreground/60 tracking-[0.15em]">
            ИИ играет с максимальной точностью
          </p>
        </div>
      )}

      {/* Lives - bottom left with label, bigger and with padding */}
      <div className="fixed bottom-8 left-8 flex flex-col items-start z-50">
        <p className="text-base text-muted-foreground/60 mb-1 uppercase tracking-[0.15em]">
          Жизни
        </p>
        <div className="flex gap-2">
          {Array.from({ length: gameState.maxLives }).map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full transition-all duration-200 ${
                i < gameState.lives
                  ? "bg-foreground"
                  : "bg-foreground/20"
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

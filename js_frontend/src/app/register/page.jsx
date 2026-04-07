"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const topRightButtonClass =
    "fixed top-7 right-8 z-50 text-right text-4xl uppercase tracking-[0.18em] text-zinc-300 transition-colors duration-200 hover:text-white hover:scale-105 md:top-12 md:right-14 md:text-5xl"

const topLeftUserClass =
    "fixed top-7 left-8 z-50 text-left text-4xl text-zinc-300 md:top-12 md:left-14 md:text-5xl"

const actionButtonClass =
    "whitespace-nowrap text-center text-4xl uppercase tracking-[0.18em] text-foreground transition-all duration-200 hover:scale-105 hover:text-white md:text-5xl"

// API base URL - change this to your backend URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export default function RegisterPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [usernameStatus, setUsernameStatus] = useState(null) // 'available', 'taken', 'checking', null
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Check username availability
  useEffect(() => {
    if (!username.trim()) {
      setUsernameStatus(null)
      return
    }

    // Debounce check
    const timeoutId = setTimeout(async () => {
      setUsernameStatus("checking")

      try {
        // Try to check username - you'll need to add this endpoint to your backend
        // If you don't have this endpoint yet, we can skip this check or implement it
        const response = await fetch(`${API_BASE_URL}/api/auth/check-username?username=${encodeURIComponent(username)}`)

        if (response.ok) {
          const data = await response.json()
          setUsernameStatus(data.available ? "available" : "taken")
        } else {
          // If endpoint doesn't exist, we'll just assume available
          setUsernameStatus("available")
        }
      } catch (err) {
        // If check fails, assume available (backend will validate anyway)
        setUsernameStatus("available")
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [username])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!username.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Заполните все поля")
      return
    }

    if (password !== confirmPassword) {
      setError("Пароли не совпадают")
      return
    }

    if (password.length < 8) {  // Changed from 4 to 8 to match backend requirement
      setError("Пароль должен быть не менее 8 символов")
      return
    }

    setIsLoading(true)

    try {
      // Исправлено: добавляем confirmPassword в запрос
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password,
          confirmPassword: confirmPassword  // ← ЭТО КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Registration successful
        console.log('Registration success:', data)

        // Auto-login after registration
        const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: username.trim(),
            password: password
          })
        })

        const loginData = await loginResponse.json()

        if (loginResponse.ok) {
          // Store auth data
          localStorage.setItem('authToken', loginData.token)
          localStorage.setItem('username', loginData.username)
          localStorage.setItem('userId', loginData.id)
          localStorage.setItem('isLoggedIn', 'true')

          router.push('/profile')
        } else {
          // Registration worked but auto-login failed
          setError("Регистрация успешна, но войдите самостоятельно")
          router.push('/login')
        }
      } else {
        // Registration failed - show detailed error
        if (data.errors) {
          // Handle validation errors
          const errorMessages = data.errors.map(err => err.message).join(', ')
          setError(errorMessages)
        } else {
          setError(data.error || data.message || "Ошибка при регистрации")
        }
      }
    } catch (err) {
      console.error('Registration error:', err)
      setError("Ошибка соединения с сервером. Убедитесь, что бэкенд запущен на " + API_BASE_URL)
    } finally {
      setIsLoading(false)
    }
  }

  const getUsernameStatusText = () => {
    switch (usernameStatus) {
      case "checking":
        return { text: "Проверка...", color: "text-zinc-400" }
      case "available":
        return { text: "Логин свободен", color: "text-green-500" }
      case "taken":
        return { text: "Логин занят", color: "text-red-500" }
      default:
        return null
    }
  }

  const statusInfo = getUsernameStatusText()

  return (
      <main className="relative isolate min-h-screen bg-background px-8 py-7 md:px-14 md:py-12">
        <img
            src="/background_v3.jpg"
            alt=""
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 -z-20 h-full w-full object-cover"
        />
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[#070b16]/65" />

        <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col">
          <div className="relative">
            <h1 className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap text-center text-6xl font-bold uppercase tracking-[0.22em] text-foreground md:text-7xl">
              Регистрация
            </h1>
            <Link href="/login" className={topRightButtonClass}>
              Назад
            </Link>
            <div className={topLeftUserClass}>
              Вход
            </div>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center">
            <form onSubmit={handleSubmit} className="flex w-full max-w-xl flex-col gap-8">
              <div className="flex flex-col gap-2">
                <label className="text-4xl tracking-[0.08em] text-white">
                  Логин
                </label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Придумайте логин..."
                    disabled={isLoading}
                    className="w-full bg-transparent border-b-2 border-foreground/30 text-foreground text-4xl py-2 tracking-[0.08em] placeholder:text-zinc-600 focus:outline-none focus:border-foreground transition-colors disabled:opacity-50"
                />
                {statusInfo && (
                    <p className={`text-2xl tracking-[0.08em] ${statusInfo.color} transition-colors`}>
                      {statusInfo.text}
                    </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-4xl tracking-[0.08em] text-white">
                  Пароль
                </label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Придумайте пароль (мин. 8 символов)..."
                    disabled={isLoading}
                    className="w-full bg-transparent border-b-2 border-foreground/30 text-foreground text-4xl py-2 tracking-[0.08em] placeholder:text-zinc-600 focus:outline-none focus:border-foreground transition-colors disabled:opacity-50"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-4xl tracking-[0.08em] text-white">
                  Повторите пароль
                </label>
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Повторите пароль..."
                    disabled={isLoading}
                    className="w-full bg-transparent border-b-2 border-foreground/30 text-foreground text-4xl py-2 tracking-[0.08em] placeholder:text-zinc-600 focus:outline-none focus:border-foreground transition-colors disabled:opacity-50"
                />
              </div>

              {error && (
                  <p className="text-3xl tracking-[0.08em] text-red-500">
                    {error}
                  </p>
              )}

              <div className="mt-8 flex flex-col items-center gap-6">
                <button
                    type="submit"
                    disabled={isLoading || usernameStatus === "taken" || usernameStatus === "checking"}
                    className={`${actionButtonClass} disabled:opacity-50`}
                >
                  {isLoading ? "Загрузка..." : "Зарегистрироваться"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
  )
}
"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const topRightButtonClass =
    "fixed top-7 right-8 z-50 text-right text-4xl uppercase tracking-[0.18em] text-zinc-300 transition-colors duration-200 hover:text-white hover:scale-105 md:top-12 md:right-14 md:text-5xl"

const topLeftUserClass =
    "fixed top-7 left-8 z-50 text-left text-4xl text-zinc-300 md:top-12 md:left-14 md:text-5xl"

const actionButtonClass =
    "whitespace-nowrap text-center text-4xl uppercase tracking-[0.18em] text-foreground transition-all duration-200 hover:scale-105 hover:text-white md:text-5xl"

const secondaryButtonClass =
    "whitespace-nowrap text-center text-3xl uppercase tracking-[0.14em] text-zinc-500 transition-all duration-200 hover:scale-105 hover:text-zinc-300 md:text-4xl"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export default function LoginPage() {
  const router = useRouter()
  const [login, setLogin] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!login.trim() || !password.trim()) {
      setError("Заполните все поля")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: login.trim(),
          password: password
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Успешный вход
        console.log('Login success:', data)

        // Сохраняем данные авторизации
        localStorage.setItem('authToken', data.token)
        localStorage.setItem('username', data.username)
        localStorage.setItem('userId', data.id)
        localStorage.setItem('isLoggedIn', 'true')

        router.push('/profile')
      } else {
        // Ошибка входа
        setError(data.error || "Неверный логин или пароль")
      }
    } catch (err) {
      console.error('Login error:', err)
      setError("Ошибка соединения с сервером. Убедитесь, что бэкенд запущен на " + API_BASE_URL)
    } finally {
      setIsLoading(false)
    }
  }

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
              Вход
            </h1>
            <Link href="/" className={topRightButtonClass}>
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
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    placeholder="Введите логин..."
                    disabled={isLoading}
                    className="w-full bg-transparent border-b-2 border-foreground/30 text-foreground text-4xl py-2 tracking-[0.08em] placeholder:text-zinc-600 focus:outline-none focus:border-foreground transition-colors disabled:opacity-50"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-4xl tracking-[0.08em] text-white">
                  Пароль
                </label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Введите пароль..."
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
                    disabled={isLoading}
                    className={`${actionButtonClass} disabled:opacity-50`}
                >
                  {isLoading ? "Загрузка..." : "Войти"}
                </button>

                <Link href="/register" className={secondaryButtonClass}>
                  Зарегистрироваться
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
  )
}
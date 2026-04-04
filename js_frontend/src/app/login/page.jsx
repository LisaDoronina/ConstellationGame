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

export default function LoginPage() {
  const router = useRouter()
  const [login, setLogin] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    console.log("API_BASE_URL:", API_BASE_URL)
    console.log("Full URL:", `${API_BASE_URL}/api/auth/register`)


    if (!login.trim() || !password.trim()) {
      setError("Заполните все поля")
      return
    }

    setIsLoading(true)
    
    // TODO: Заглушка для бэкенда - заменить на реальный API вызов
    // Пример: const response = await fetch('/api/auth/login', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ login, password })
    // })
    
    try {
      // Имитация задержки запроса
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // ЗАГЛУШКА: Здесь должна быть проверка логина/пароля через API
      // Временно принимаем любые данные для демонстрации
      const mockSuccess = true // Заменить на реальную проверку
      
      if (mockSuccess) {
        // TODO: Сохранить токен/сессию, полученные с бэкенда
        // localStorage.setItem('authToken', response.token)
        // localStorage.setItem('username', response.username)
        
        // Временно сохраняем username для демо
        localStorage.setItem('username', login)
        localStorage.setItem('isLoggedIn', 'true')
        
        router.push('/profile')
      } else {
        setError("Неверный логин или пароль")
      }
    } catch (err) {
      setError("Ошибка соединения с сервером")
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

import { Amatic_SC } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const amaticSc = Amatic_SC({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  variable: "--font-amatic-sc",
});

export const metadata = {
  title: 'Созвездия — Игра',
  description: 'Игра в созвездия в стиле Cube Escape',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="ru" className="dark">
      <body className={`${amaticSc.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}

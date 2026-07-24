import type { Metadata } from 'next'
import Footer from '@/components/Footer'
import './globals.css'

export const metadata: Metadata = {
  title: 'FanZoned26 — FIFA World Cup 2026',
  description: 'Your ultimate FIFA World Cup 2026 fan platform. Live chat, predictions, stats.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
      </head>
      <body className="min-h-full antialiased flex flex-col">
        {children}
        <Footer />
      </body>
    </html>
  )
}

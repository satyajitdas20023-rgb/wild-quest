import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'WildQuest — Notice the wild',
  description: 'A calm field guide for discovering species, completing quests, and keeping your wildlife collection.',
  generator: 'v0.app',
  icons: {
  icon: '/favicon.ico',
},
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f7f4ec',
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

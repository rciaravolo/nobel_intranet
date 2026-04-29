import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter_Tight, JetBrains_Mono } from 'next/font/google'
import { Providers } from '@/components/providers'
import './globals.css'

/* Display / headings — Cormorant Garamond */
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
})

/* Body / UI — Inter Tight */
const interTight = Inter_Tight({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

/* Dados / números — JetBrains Mono */
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'INTRA — Nobel Capital',
  description: 'Sistema interno Nobel Capital & XP Investimentos',
  robots: 'noindex, nofollow',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${cormorant.variable} ${interTight.variable} ${jetbrainsMono.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

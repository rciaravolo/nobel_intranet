import { Providers } from '@/components/providers'
import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { JetBrains_Mono } from 'next/font/google'
import './globals.css'

/* Body / UI — Garet (Nobel branding) */
const garet = localFont({
  src: [
    { path: '../../public/fonts/garet/Garet-Book.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/garet/Garet-Heavy.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-sans',
  display: 'swap',
})

/* Display / editorial — Relicta (Nobel branding) */
const relicta = localFont({
  src: [
    { path: '../../public/fonts/relicta/Relicta-Light.otf', weight: '300', style: 'normal' },
    { path: '../../public/fonts/relicta/Relicta-UltraboldItalic.otf', weight: '800', style: 'italic' },
  ],
  variable: '--font-display',
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
      <body
        className={`${garet.variable} ${relicta.variable} ${jetbrainsMono.variable}`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

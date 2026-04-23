import type { Metadata } from 'next'
import { Geist, Lora } from 'next/font/google'
import { Providers } from '@/components/providers'
import './globals.css'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
})

const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-lora',
})

export const metadata: Metadata = {
  title: 'INTRA — Nobel Capital',
  description: 'Sistema interno Nobel Capital & XP Investimentos',
  robots: 'noindex, nofollow',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${geist.variable} ${lora.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

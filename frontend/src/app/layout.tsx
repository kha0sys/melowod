import type { Metadata } from 'next'
import { Inter, Black_Ops_One } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const blackOps = Black_Ops_One({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-black-ops',
})

export const metadata: Metadata = {
  title: 'MeloWOD - Tu compañero de CrossTraining',
  description: 'Registra tus WODs, compite globalmente y alcanza nuevos límites',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${inter.variable} ${blackOps.variable}`}>
      <body className={inter.variable}>
        <Navbar />
        <main className="min-h-screen bg-background">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  )
}

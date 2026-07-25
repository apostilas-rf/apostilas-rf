import type { Metadata } from 'next'
import { Open_Sans } from 'next/font/google'
import './globals.css'

const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'Apostilas RF - Plataforma de Produção',
  description: 'Plataforma para gerenciar produção de apostilas escolares RF',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={openSans.variable}>
      <body className="bg-white text-gray-900 font-sans">
        {children}
      </body>
    </html>
  )
}

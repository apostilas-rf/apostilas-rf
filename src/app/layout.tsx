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
    // suppressHydrationWarning: o script abaixo altera a classe do <html>
    // antes da hidratacao, entao servidor e cliente divergem de proposito
    <html lang="pt-BR" className={openSans.variable} suppressHydrationWarning>
      <head>
        {/* Aplica o tema antes da primeira pintura, evitando piscar
            e mantendo a classe consistente em todas as paginas */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('dark-mode')==='true'){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){}`,
          }}
        />
      </head>
      <body className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
        {children}
      </body>
    </html>
  )
}

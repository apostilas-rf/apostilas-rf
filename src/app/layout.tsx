import type { Metadata } from 'next'
import { Open_Sans, Ubuntu } from 'next/font/google'
import './globals.css'

const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
})

const ubuntu = Ubuntu({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-ubuntu',
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
    <html lang="pt-BR" className={`${openSans.variable} ${ubuntu.variable}`} suppressHydrationWarning>
      <head>
        {/* Aplica o tema antes da primeira pintura, evitando piscar
            e mantendo a classe consistente em todas as paginas */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{const isDark=localStorage.getItem('dark-mode')==='true';if(isDark){document.documentElement.classList.add('dark');document.body.style.backgroundColor='#0a0f1a'}else{document.documentElement.classList.remove('dark');document.body.style.backgroundColor='#eef3f0'}}catch(e){}}`,
          }}
        />
      </head>
      <body className="text-gray-900 dark:text-gray-100 font-sans" style={{ backgroundColor: '#eef3f0' }}>
        {children}
      </body>
    </html>
  )
}

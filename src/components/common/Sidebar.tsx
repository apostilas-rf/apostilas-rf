'use client'

import { usePathname } from 'next/navigation'
import { useSidebar } from '@/contexts/SidebarContext'
import type { UserRole } from '@/types'

interface SidebarLink {
  href: string
  label: string
  roles: UserRole[]
}

const links: SidebarLink[] = [
  {
    href: '/dashboard',
    label: 'Painel',
    roles: ['PROFESSOR', 'DIAGRAMADOR', 'ILUSTRADOR', 'REVISOR', 'EDITOR', 'GESTOR', 'DIRECAO', 'PROPRIETARIO'],
  },
  {
    href: '/dashboard/apostilas',
    label: 'Minhas Apostilas',
    roles: ['PROFESSOR', 'DIAGRAMADOR', 'ILUSTRADOR', 'REVISOR', 'EDITOR', 'GESTOR', 'DIRECAO', 'PROPRIETARIO'],
  },
  {
    href: '/dashboard/professores',
    label: 'Professores',
    roles: ['GESTOR'],
  },
  {
    href: '/dashboard/meus-capitulos',
    label: 'Meus Capítulos',
    roles: ['PROFESSOR'],
  },
  {
    href: '/dashboard/diagramadores',
    label: 'Diagramação',
    roles: ['DIAGRAMADOR', 'GESTOR'],
  },
  {
    href: '/dashboard/ilustrador',
    label: 'Ilustração',
    roles: ['ILUSTRADOR', 'GESTOR'],
  },
  {
    href: '/dashboard/revisores',
    label: 'Revisão',
    roles: ['REVISOR', 'GESTOR'],
  },
  {
    href: '/dashboard/templates',
    label: 'Templates',
    roles: ['PROFESSOR', 'DIAGRAMADOR', 'ILUSTRADOR', 'REVISOR', 'EDITOR', 'GESTOR', 'DIRECAO', 'PROPRIETARIO'],
  },
  {
    href: '/dashboard/prazos',
    label: 'Prazos',
    roles: ['GESTOR'],
  },
  {
    href: '/dashboard/admin-cadastros',
    label: '👥 Aprovar Cadastros',
    roles: ['GESTOR'],
  },
  {
    href: '/dashboard/perfil',
    label: 'Meu Perfil',
    roles: ['PROFESSOR', 'DIAGRAMADOR', 'ILUSTRADOR', 'REVISOR', 'EDITOR', 'GESTOR', 'DIRECAO', 'PROPRIETARIO'],
  },
]

export function Sidebar({ userRole }: { userRole: UserRole }) {
  const pathname = usePathname()
  const { aberto, fechar } = useSidebar()

  const filteredLinks = links.filter((link) => link.roles.includes(userRole))

  const navegacao = (
    <nav className="mx-3 mb-4 px-3 py-4 space-y-2 rounded-2xl border-2 border-rf-green/30 bg-rf-green/5 dark:bg-rf-green/10">
      {filteredLinks.map((link) => {
        const isActive =
          link.href === '/dashboard'
            ? pathname === link.href
            : pathname === link.href || pathname.startsWith(link.href + '/')
        return (
          <a
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-full text-sm font-semibold transition-all duration-300 block ${
              isActive
                ? 'bg-gradient-to-r from-rf-green to-emerald-600 text-white shadow-elevated hover:shadow-floating'
                : 'text-gray-700 dark:text-gray-200 bg-gray-400/10 dark:bg-gray-700/40 hover:bg-gray-400/20 dark:hover:bg-gray-700/60 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {link.label}
          </a>
        )
      })}
    </nav>
  )

  const titulo = (
    <div className="px-3 py-4 text-center">
      <h2 className="text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest">
        Menu Principal
      </h2>
    </div>
  )

  return (
    <>
      {/* Desktop: coluna fixa ao lado do conteúdo */}
      <aside className="hidden md:block w-64 shrink-0 backdrop-blur-sm border-r border-gray-200/60 bg-white dark:bg-gray-900 dark:border-gray-800 min-h-screen sticky top-0">
        {titulo}
        {navegacao}
      </aside>

      {/* Celular: gaveta sobre o conteúdo, já que 256px fixos não cabem */}
      <div
        onClick={fechar}
        aria-hidden="true"
        className={`md:hidden fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          aberto ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <aside
        className={`md:hidden fixed top-0 left-0 z-50 h-full w-72 max-w-[85vw] overflow-y-auto bg-white dark:bg-gray-900 border-r border-gray-200/60 dark:border-gray-800 shadow-floating transition-transform duration-300 ${
          aberto ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200/60 dark:border-gray-800">
          <h2 className="text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest">
            Menu Principal
          </h2>
          <button
            onClick={fechar}
            aria-label="Fechar menu"
            className="p-2 -mr-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {navegacao}
      </aside>
    </>
  )
}

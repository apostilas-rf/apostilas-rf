'use client'

import { usePathname } from 'next/navigation'
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
    href: '/dashboard/admin-ilustrador',
    label: '⚙️ Admin Ilustração',
    roles: ['GESTOR'],
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
    href: '/dashboard/perfil',
    label: 'Meu Perfil',
    roles: ['PROFESSOR', 'DIAGRAMADOR', 'ILUSTRADOR', 'REVISOR', 'EDITOR', 'GESTOR', 'DIRECAO', 'PROPRIETARIO'],
  },
]

export function Sidebar({ userRole }: { userRole: UserRole }) {
  const pathname = usePathname()

  const filteredLinks = links.filter((link) => link.roles.includes(userRole))

  return (
    <aside className="w-64 backdrop-blur-sm border-r border-gray-200/60 bg-white dark:bg-gray-900 dark:border-gray-800 min-h-screen sticky top-0">
      <div className="px-3 py-4 text-center">
        <h2 className="text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest">Menu Principal</h2>
      </div>

      <nav className="mx-3 mb-4 px-3 py-4 space-y-2 rounded-2xl border-2 border-rf-green/30 bg-rf-green/5 dark:bg-rf-green/10">
        {filteredLinks.map((link) => {
          const isActive = link.href === '/dashboard'
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
    </aside>
  )
}

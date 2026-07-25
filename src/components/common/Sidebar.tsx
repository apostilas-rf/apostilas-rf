'use client'

import Link from 'next/link'
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
    href: '/dashboard/meus-capitulos',
    label: 'Meus Capítulos',
    roles: ['PROFESSOR'],
  },
  {
    href: '/dashboard/diagramadores',
    label: 'Diagramação',
    roles: ['DIAGRAMADOR'],
  },
  {
    href: '/dashboard/revisores',
    label: 'Revisão',
    roles: ['REVISOR'],
  },
  {
    href: '/dashboard/professores',
    label: 'Professores',
    roles: ['GESTOR'],
  },
  {
    href: '/dashboard/diagramadores',
    label: 'Diagramadores',
    roles: ['GESTOR'],
  },
  {
    href: '/dashboard/revisores',
    label: 'Revisores',
    roles: ['GESTOR'],
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
      <div className="p-6 border-b border-gray-200/60 dark:border-gray-800">
        <h2 className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest">Menu Principal</h2>
      </div>

      <nav className="space-y-2 px-3 py-4">
        {filteredLinks.map((link) => {
          const isActive = link.href === '/dashboard'
            ? pathname === link.href
            : pathname === link.href || pathname.startsWith(link.href + '/')
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-rf-green to-emerald-600 text-white shadow-elevated hover:shadow-floating'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100/60 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
